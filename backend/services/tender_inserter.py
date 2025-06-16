# services/tender_inserter.py

from datetime import datetime
from pymongo import MongoClient
import traceback
import os
from dotenv import load_dotenv
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["tender_system"]
filtered_tenders = db["filtered_tenders"]

def insert_tender_document(metadata: dict):
    """
    Inserts or updates a tender in the filtered_tenders collection using form_url as the unique key.
    """
    try:
        form_url = metadata.get("form_url")
        if not form_url:
            raise ValueError("Missing form_url in metadata")

        # Build tender document
        tender_doc = {
            "form_url": form_url,
            "title": metadata.get("title"),
            "reference_number": metadata.get("reference_number"),
            "institute": metadata.get("institute"),
            "location": metadata.get("location"),
            "business_category": metadata.get("business_category", []),
            "scope_of_work": metadata.get("scope_of_work"),
            "estimated_budget": metadata.get("estimated_budget"),
            "deadline": metadata.get("deadline"),
            "emd": metadata.get("emd", {}),
            "tender_fee": metadata.get("tender_fee", {}),
            "documents_required": metadata.get("documents_required", []),
            "experience": metadata.get("experience", {}),
            "certifications": metadata.get("certifications", []),
            "eligibility_notes": metadata.get("eligibility_notes"),
            "created_at": datetime.utcnow(),
            "source_url": form_url
        }

        existing = filtered_tenders.find_one({"form_url": form_url})

        if existing:
            filtered_tenders.update_one(
                {"_id": existing["_id"]},
                {"$set": tender_doc}
            )
            return str(existing["_id"]), "updated"
        else:
            result = filtered_tenders.insert_one(tender_doc)
            return str(result.inserted_id), "inserted"

    except Exception as e:
        print("Error inserting tender:", traceback.format_exc())
        return None, "error"
