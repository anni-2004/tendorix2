from azure.storage.blob import (
    BlobServiceClient,
    generate_blob_sas,
    BlobSasPermissions
)
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os

# Load environment
load_dotenv()

# Azure configs
AZURE_CONN_STR = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME", "")
AZURE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY", "")
AZURE_CONTAINER = os.getenv("AZURE_BLOB_CONTAINER", "")

# Mongo configs
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME1")

# Initialize clients
blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONN_STR)
container_client = blob_service_client.get_container_client(AZURE_CONTAINER)

mongo_client = MongoClient(MONGO_URI)
collection = mongo_client[DB_NAME][COLLECTION_NAME]


def is_sas_expired(url: str) -> bool:
    try:
        query = parse_qs(urlparse(url).query)
        expiry_str = query.get("se", [None])[0]
        if not expiry_str:
            return True  # No expiry date found
        expiry_dt = datetime.strptime(expiry_str, "%Y-%m-%dT%H:%M:%SZ")
        return datetime.utcnow() > expiry_dt
    except Exception as e:
        print(f"⚠️ Error checking expiry for {url}: {e}")
        return True


def extract_blob_name(url: str) -> str:
    return urlparse(url).path.split("/")[-1]


def regenerate_sas_url(blob_name: str, days_valid=365) -> str:
    sas_token = generate_blob_sas(
        account_name=AZURE_ACCOUNT_NAME,
        container_name=AZURE_CONTAINER,
        blob_name=blob_name,
        account_key=AZURE_ACCOUNT_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(days=days_valid),
    )
    return f"https://{AZURE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_CONTAINER}/{blob_name}?{sas_token}"


def refresh_expired_links():
    documents = collection.find({
        "$or": [
            {"form_url": {"$regex": r"^https://.*\?.*se="}},
            {"source_url": {"$regex": r"^https://.*\?.*se="}}
        ]
    })

    for doc in documents:
        updated = False
        doc_id = doc["_id"]

        for field in ["form_url", "source_url"]:
            url = doc.get(field)
            if url and is_sas_expired(url):
                blob_name = extract_blob_name(url)
                new_url = regenerate_sas_url(blob_name)
                collection.update_one({"_id": doc_id}, {"$set": {field: new_url}})
                print(f"✅ Updated {field} for document {doc_id}")
                updated = True

        if not updated:
            print(f"✅ Document {doc_id} already has valid SAS tokens.")

if __name__ == "__main__":
    refresh_expired_links()
