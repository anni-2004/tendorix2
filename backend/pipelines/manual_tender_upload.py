# pipelines/manual_tender_upload.py

from services.blob_uploader import upload_to_blob
from services.tender_inserter import insert_tender_document

def upload_and_store_tender(local_pdf_path: str, tender_metadata: dict):
    print(f"Uploading document: {local_pdf_path}")
    form_url = upload_to_blob(local_pdf_path)

    if not form_url:
        print("❌ Upload failed.")
        return

    tender_metadata["form_url"] = form_url

    tender_id, status = insert_tender_document(tender_metadata)
    print(f"✅ Tender {status.upper()} with ID: {tender_id}")

# ---------- USAGE EXAMPLE BELOW ----------

if __name__ == "__main__":
    sample_metadata = {
        "title": "Maintenance of Greenery at Terrace park in Circle-30, Begumpet, Secunderabad Zone, GHMC for (12) months during the year 2025-26 (Reserved for ST Category Only)",
        "reference_number": "12/UB/2025-26",
        "institute": "GREATER HYDERABAD MUNICIPAL CORPORATION||Deputy Director North Zone VB Parks",
        "location": "Circle-30, Begumpet, Secunderabad Zone, Hyderabad, Telangana",
        "business_category": ["Works", "Similar Works"],
        "scope_of_work": "Maintenance of Greenery at Terrace park in Circle-30, Begumpet, Secunderabad Zone, GHMC for (12) months during the year 2025-26 (Reserved for ST Category Only)",
        "estimated_budget": 266900,
        "deadline": "17-Jun-2025 03:30 PM",
        "emd": {
            "amount": 6673,
            "exemption": ["Exempted", "Online Payment", "Challan Generation", "BG"]
        },
        "tender_fee": {
            "amount": 95,
            "exemption": []
        },
        "documents_required": [
            "Experience Certificate issued by the Concerned Authority (Not less than the rank of Drawing Officer)",
            "ESI Registration certificate and latest ESI challans (Paid challan to be uploaded should have been remitted during the past 3 months from the date of this tender notification)",
            "EPF Registration certificate and latest EPF challans (Paid challan to be uploaded should have been remitted during the past 3 months from the date of this tender notification)",
            "Proof of valid Labour license issued by competent authority should be uploaded by the bidder",
            "The agency should be uploaded latest caste certificate issued by competent authority is mandatory"
        ],
        "experience": {
            "years": None,
            "sector": ""
        },
        "certifications": [],
        "eligibility_notes": ""
    }

    upload_and_store_tender(r"D:\anni\tender docs\12 Tender document terms and conditions.pdf", sample_metadata)
