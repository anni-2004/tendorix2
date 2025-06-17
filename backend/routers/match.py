from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from core.database import db
from services.basic_filter import filter_tenders
from services.eligibility_extractor import extract_eligibility_text_from_url
from services.eligibility_parser import extract_eligibility_json_general
from services.tender_matcher import compute_tender_match_score
from routers.auth import get_current_user
from datetime import datetime
import traceback

router = APIRouter()

companies = db["companies"]
tenders = db["filtered_tenders"]

def serialize_tender(tender):
    """Convert ObjectId to string for JSON serialization"""
    if "_id" in tender:
        tender["_id"] = str(tender["_id"])
    return tender

@router.get("/tenders/summary")
def get_tenders_summary(current_user: dict = Depends(get_current_user)):
    """Get total and filtered tender counts"""
    try:
        # Get user's company profile
        company = companies.find_one({"user_id": current_user["id"]})
        if not company:
            raise HTTPException(status_code=404, detail="Company profile not found. Please complete your profile first.")

        total_tenders = tenders.count_documents({})
        filtered = filter_tenders(company)
        
        # Serialize filtered tenders
        serialized_filtered = [serialize_tender(t) for t in filtered]

        return {
            "total_tenders": total_tenders,
            "filtered_tenders": len(serialized_filtered),
            "filtered_list": serialized_filtered
        }
    except Exception as e:
        print(f"Summary error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get tender summary: {str(e)}")

@router.post("/tenders/match")
def match_tenders(current_user: dict = Depends(get_current_user)):
    """Run tender matching pipeline"""
    try:
        # Get user's company profile
        company = companies.find_one({"user_id": current_user["id"]})
        if not company:
            raise HTTPException(status_code=404, detail="Company profile not found. Please complete your profile first.")

        # Get filtered tenders
        filtered_tenders_list = filter_tenders(company)
        
        if not filtered_tenders_list:
            return {
                "message": "No tenders match your company profile",
                "matches": []
            }

        threshold = 70.0
        results = []

        for tender in filtered_tenders_list:
            form_url = tender.get("form_url")
            if not form_url:
                continue

            try:
                # Extract eligibility information
                raw_eligibility = tender.get("raw_eligibility")
                if not raw_eligibility:
                    raw_eligibility = extract_eligibility_text_from_url(form_url)
                    if raw_eligibility:
                        # Update tender with extracted eligibility
                        tenders.update_one(
                            {"_id": tender["_id"]},
                            {"$set": {"raw_eligibility": raw_eligibility, "last_updated": datetime.utcnow()}}
                        )

                structured_eligibility = tender.get("structured_eligibility")
                if not structured_eligibility:
                    structured_eligibility = extract_eligibility_json_general(raw_eligibility)
                    if structured_eligibility:
                        # Update tender with structured eligibility
                        tenders.update_one(
                            {"_id": tender["_id"]},
                            {"$set": {"structured_eligibility": structured_eligibility, "last_updated": datetime.utcnow()}}
                        )

                # Compute match score
                result = compute_tender_match_score(structured_eligibility, company)

                if result["matching_score"] >= threshold:
                    match_data = {
                        "_id": str(tender["_id"]),
                        "title": tender.get("title"),
                        "reference_number": tender.get("reference_number"),
                        "location": tender.get("location"),
                        "business_category": tender.get("business_category", []),
                        "deadline": tender.get("deadline"),
                        "form_url": form_url,
                        "matching_score": result["matching_score"],
                        "field_scores": result["field_scores"],
                        "eligible": result["eligible"],
                        "missing_fields": result["missing_fields"],
                        "emd": tender.get("emd"),
                        "estimated_budget": tender.get("estimated_budget")
                    }
                    results.append(match_data)

            except Exception as tender_error:
                print(f"Error processing tender {tender.get('title')}: {str(tender_error)}")
                continue

        # Sort by matching score (highest first)
        results.sort(key=lambda x: x["matching_score"], reverse=True)

        return {
            "message": f"Found {len(results)} matching tenders",
            "matches": results
        }

    except Exception as e:
        print(f"Matching error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to match tenders: {str(e)}")

@router.get("/tenders/{tender_id}/summarize")
def summarize_tender(tender_id: str, current_user: dict = Depends(get_current_user)):
    """Generate AI summary for a specific tender"""
    try:
        # Get tender details
        tender = tenders.find_one({"_id": ObjectId(tender_id)})
        if not tender:
            raise HTTPException(status_code=404, detail="Tender not found")

        # Create a comprehensive summary from available tender data
        summary_parts = []
        
        if tender.get("title"):
            summary_parts.append(f"Title: {tender['title']}")
        
        if tender.get("scope_of_work"):
            summary_parts.append(f"Scope: {tender['scope_of_work']}")
        elif tender.get("title"):
            summary_parts.append(f"This tender is for {tender['title'].lower()}")
        
        if tender.get("location"):
            summary_parts.append(f"Location: {tender['location']}")
        
        if tender.get("estimated_budget"):
            summary_parts.append(f"Estimated Budget: ₹{tender['estimated_budget']:,}")
        
        if tender.get("deadline"):
            summary_parts.append(f"Deadline: {tender['deadline']}")
        
        if tender.get("business_category"):
            summary_parts.append(f"Categories: {', '.join(tender['business_category'])}")
        
        if tender.get("emd") and isinstance(tender["emd"], dict):
            emd_amount = tender["emd"].get("amount")
            if emd_amount:
                summary_parts.append(f"EMD Amount: ₹{emd_amount:,}")
        
        if tender.get("documents_required"):
            summary_parts.append(f"Required Documents: {', '.join(tender['documents_required'][:3])}{'...' if len(tender['documents_required']) > 3 else ''}")

        # Create a comprehensive summary
        summary = ". ".join(summary_parts) + "."
        
        if not summary_parts:
            summary = "This tender contains standard procurement requirements. Please review the full document for detailed specifications and requirements."

        return {
            "tender_id": tender_id,
            "summary": summary
        }

    except Exception as e:
        print(f"Summarization error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to summarize tender: {str(e)}")