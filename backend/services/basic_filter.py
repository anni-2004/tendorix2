from pymongo import MongoClient
from sentence_transformers import SentenceTransformer, util
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
filtered_tenders = client["tender_system"]["filtered_tenders"]

model = SentenceTransformer("all-MiniLM-L6-v2")


def get_company_categories(company_profile: dict):
    """
    Dynamically extract company categories from capabilities and experience.
    """
    capability_keywords = []

    caps = company_profile.get("capabilities", {})
    for key in ["businessRoles", "industrySectors", "productServiceKeywords", "technicalCapabilities"]:
        if caps.get(key):
            capability_keywords.extend(caps[key].split(","))

    tenders = company_profile.get("tender_experience", {})
    if tenders.get("tenderTypesHandled"):
        capability_keywords.extend(tenders["tenderTypesHandled"].split(","))

    # Normalize and deduplicate
    clean_categories = list({kw.strip().lower() for kw in capability_keywords if kw.strip()})
    return clean_categories


def is_category_similar(list1, list2, threshold=0.6):
    """
    Semantic similarity check between two category lists.
    """
    for a in list1:
        for b in list2:
            a_enc = model.encode(a, convert_to_tensor=True)
            b_enc = model.encode(b, convert_to_tensor=True)
            score = util.cos_sim(a_enc, b_enc).item()
            if score >= threshold:
                return True
    return False


def filter_tenders(company_profile: dict):
    """
    Filter tenders from DB based on semantic similarity to company categories.
    """
    company_categories = get_company_categories(company_profile)
    print("📌 Company Category Keywords:", company_categories)

    tenders = list(filtered_tenders.find())
    print(f"📦 Total Tenders Fetched from DB: {len(tenders)}")

    results = []
    for tender in tenders:
        print("➡️ Tender Title:", tender.get("title"))
        tender_categories = [cat.strip().lower() for cat in tender.get("business_category", []) if cat.strip()]
        print("   Tender Categories:", tender_categories)

        if is_category_similar(company_categories, tender_categories):
            print("   ✅ Category matched")
            results.append(tender)
        else:
            print("   ❌ No match")

    print(f"🧮 Tenders after filtering: {len(results)}")
    return results
