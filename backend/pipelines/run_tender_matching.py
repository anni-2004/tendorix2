from pymongo import MongoClient
from datetime import datetime
from services.eligibility_extractor import extract_eligibility_text_from_url
from services.eligibility_parser import extract_eligibility_json_general
from services.tender_matcher import compute_tender_match_score
from services.basic_filter import filter_tenders
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()
from core.database import db
companies = db["companies"]
filtered_tenders = db["filtered_tenders"]


def run_matching_for_company(company_id: str, location=None, category=None, institute=None, before_deadline=None):
    print(f"Total tenders in DB: {filtered_tenders.count_documents({})}") 
    try:
        company_obj_id = ObjectId(company_id)
    except Exception as e:
        print(f"[❌] Invalid company ID format: {e}")
        return

    company = companies.find_one({"_id": company_obj_id})
    if not company:
        print(f"[❌] Company with ID {company_id} not found in the database.")
        return

    print(f"[ℹ️] Running match for company: {company.get('name', company_id)}")

    relevant_tenders = filter_tenders(location, category, institute, before_deadline)
    print(f"[ℹ️] Found {len(relevant_tenders)} relevant tenders.")

    matched_results = []

    for tender in relevant_tenders:
        print(f"\n🔎 Checking tender object: {tender}")
        tender_id = tender.get("_id")
        if not tender_id:
            print("[⚠️] Tender has no _id field. Skipping...")
            continue

        updated_fields = {}
        created_at = tender.get("created_at")
        print(f"📅 Tender created at: {created_at}")

        # Extract raw eligibility
        raw_eligibility = tender.get("raw_eligibility")
        structured = tender.get("structured_eligibility")
        form_url = tender.get("form_url") or tender.get("doc_url")

        if not form_url:
            print(f"[⚠️] Tender {tender_id} has no form_url or doc_url. Skipping...")
            continue
        if not form_url.startswith("http"):
            print(f"[⚠️] Tender {tender_id} has invalid URL format: {form_url}. Skipping...")
            continue

        if not raw_eligibility:
            print(f"📄 Attempting eligibility text extraction for tender {tender_id} with URL: {form_url}")
            try:
                raw_eligibility = extract_eligibility_text_from_url(form_url)
                if raw_eligibility:
                    updated_fields["raw_eligibility"] = raw_eligibility
                else:
                    print(f"[⚠️] No eligibility section found for tender {tender_id}. Skipping...")
                    continue
            except Exception as e:
                print(f"[❌] Failed to extract eligibility for tender {tender_id}: {e}")
                continue

        if not structured:
            try:
                structured = extract_eligibility_json_general(raw_eligibility)
                if structured:
                    updated_fields["structured_eligibility"] = structured
                else:
                    print(f"[⚠️] Structured eligibility extraction failed for tender {tender_id}. Skipping...")
                    continue
            except Exception as e:
                print(f"[❌] Structured parsing failed for tender {tender_id}: {e}")
                continue

        # Log and update stale tenders
        if updated_fields:
            updated_fields["last_updated"] = datetime.utcnow()
            print(f"[✅] Updating tender {tender_id} with: {list(updated_fields.keys())}")
            filtered_tenders.update_one({"_id": tender_id}, {"$set": updated_fields})

        # Compute match score
        result = compute_tender_match_score(structured, company)
        result["tender_id"] = str(tender_id)
        result["tender_title"] = tender.get("title", "No Title")
        matched_results.append(result)

    # Final match results
    print(f"\n=== ✅ Match Results for Company: {company.get('name', company_id)} ===")
    for res in matched_results:
        print(f"\n📌 Tender: {res['tender_title']}")
        print(f"🔢 Score: {res['matching_score']}%")
        print(f"📍 Eligible: {'✅' if res['eligible'] else '❌'}")
        if res["missing_fields"]:
            print(f"❗ Missing Fields: {res['missing_fields']}")

if __name__ == "__main__":
    COMPANY_ID = "6849a66fe25894f4e182ae35"
    LOCATION = None
    CATEGORY = None
    INSTITUTE = None
    BEFORE_DEADLINE = None

    run_matching_for_company(COMPANY_ID, LOCATION, CATEGORY, INSTITUTE, BEFORE_DEADLINE)
