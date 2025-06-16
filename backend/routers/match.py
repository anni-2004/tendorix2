from fastapi import APIRouter, HTTPException

from bson import ObjectId

import os

from services.basic_filter import filter_tenders
from services.eligibility_extractor import extract_eligibility_text_from_url
from services.eligibility_parser import extract_eligibility_json_general
from services.tender_matcher import compute_tender_match_score

router = APIRouter()



from core.database import db
companies = db["companies"]
tenders = db["filtered_tenders"]


# ✅ Endpoint 1: Return total + filtered counts
from fastapi.responses import JSONResponse
from bson import ObjectId

# Helper function to convert ObjectId to string
def serialize_tender(tender):
    tender["_id"] = str(tender["_id"])
    return tender

@router.get("/match/summary")
def get_summary(company_id: str):
    try:
        company_obj_id = ObjectId(company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company ID format")

    print("📋 Available companies in DB:")
    for doc in companies.find({}, {"_id": 1, "companyDetails.name": 1}):
        print(doc)

    company = companies.find_one({"_id": company_obj_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    total_tenders = tenders.count_documents({})
    filtered = filter_tenders(company)

    # Serialize _id fields
    serialized_filtered = [serialize_tender(t) for t in filtered]

    return {
        "total_tenders": total_tenders,
        "filtered_tenders": len(serialized_filtered),
        "filtered_list": serialized_filtered
    }

@router.get("/company/list_ids")
def list_companies():
    company_list = companies.find({}, {"_id": 1, "companyDetails.name": 1})
    return [{"_id": str(doc["_id"]), "name": doc.get("companyDetails", {}).get("name", "")} for doc in company_list]

# ✅ Endpoint 2: Match filtered tenders
@router.post("/match/match_tenders")
def match_filtered_tenders(payload: dict):
    company = payload.get("company")
    filtered_tenders = payload.get("filtered_tenders")

    if not company or not filtered_tenders:
        raise HTTPException(status_code=400, detail="Missing data for matching")

    threshold = 70.0  # Fixed backend threshold

    results = []
    for tender in filtered_tenders:
        form_url = tender.get("form_url")
        if not form_url:
            continue

        try:
            raw_eligibility = extract_eligibility_text_from_url(form_url)
            print(f"📄 Raw eligibility text extracted for tender {tender.get('title')}: {raw_eligibility}")
            structured_eligibility = extract_eligibility_json_general(raw_eligibility)
            print(f"📄 Eligibility extracted for tender {tender.get('title')}: {structured_eligibility}")

            result = compute_tender_match_score(structured_eligibility, company)

            if result["matching_score"] >= threshold:
                results.append({
                    "title": tender.get("title"),
                    "reference_number": tender.get("reference_number"),
                    "form_url": form_url,
                    "matching_score": result["matching_score"],
                    "field_scores": result["field_scores"],
                    "eligible": result["eligible"],
                    "missing_fields": result["missing_fields"],
                    "emd": tender.get("emd"),
                    "business_category": tender.get("business_category")
                })

        except Exception as e:
            print(f"❌ Error processing tender {tender.get('title')}: {e}")

    return results
