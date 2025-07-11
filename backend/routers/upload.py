from fastapi import APIRouter, Form, Request
from fastapi.responses import JSONResponse, HTMLResponse
from pymongo import MongoClient
from bson import ObjectId
import traceback

from services.eligibility_extractor import extract_eligibility_text_from_url
from services.eligibility_parser import extract_eligibility_json_general
from services.tender_matcher import compute_tender_match_score

router = APIRouter()
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["tender_system"]
companies = db["companies"]
filtered_tenders = db["filtered_tenders"]
matches = db["matches"]

# ✅ Single Tender Matching
@router.post("/process-tender", response_class=HTMLResponse)
async def process_tender(form_url: str = Form(...), company_id: str = Form(...)):
    try:
        company_doc = companies.find_one({"_id": ObjectId(company_id)})
        if not company_doc:
            return HTMLResponse(content="Company not found", status_code=404)

        cached = matches.find_one({"company_id": company_id, "form_url": form_url})
        if cached:
            return HTMLResponse(content=f"<pre>{cached['result_json']}</pre>", status_code=200)

        raw_text = extract_eligibility_text_from_url(form_url)
        structured = extract_eligibility_json_general(raw_text)
        result = compute_tender_match_score(structured, company_doc)

        matches.insert_one({
            "company_id": company_id,
            "form_url": form_url,
            "result_json": result,
            "structured": structured
        })

        return HTMLResponse(content=f"<pre>{result}</pre>", status_code=200)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# ✅ Batch Tender Matching
@router.post("/batch-process-tenders", response_class=HTMLResponse)
def batch_process_tenders(company_id: str = Form(...)):
    try:
        company_doc = companies.find_one({"_id": ObjectId(company_id)})
        if not company_doc:
            return HTMLResponse(content="Company not found", status_code=404)

        processed = []
        tenders = filtered_tenders.find()

        for tender in tenders:
            form_url = tender.get("form_url")
            if not form_url:
                continue

            cached = matches.find_one({"company_id": company_id, "form_url": form_url})
            if cached:
                processed.append({"form_url": form_url, "status": "cached"})
                continue

            try:
                raw_text = extract_eligibility_text_from_url(form_url)
                structured = extract_eligibility_json_general(raw_text)
                result = compute_tender_match_score(structured, company_doc)

                matches.insert_one({
                    "company_id": company_id,
                    "form_url": form_url,
                    "tender_id": str(tender["_id"]),
                    "structured": structured,
                    "result_json": result,
                })

                processed.append({
                    "form_url": form_url,
                    "status": "processed",
                    "score": result.get("matching_score", None)
                })

            except Exception as tender_error:
                processed.append({
                    "form_url": form_url,
                    "status": "error",
                    "error": str(tender_error)
                })

        return JSONResponse(content={"results": processed}, status_code=200)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# ✅ HTML UI Loader
@router.get("/upload-test", response_class=HTMLResponse)
def upload_test():
    with open("templates/upload_test.html") as f:
        return HTMLResponse(content=f.read())
