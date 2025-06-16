from azure.storage.blob import (
    BlobServiceClient,
    generate_blob_sas,
    BlobSasPermissions,
    ContentSettings
)
from datetime import datetime, timedelta
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

AZURE_CONN_STR = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_CONTAINER = os.getenv("AZURE_BLOB_CONTAINER", "")
AZURE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME", "")
AZURE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY", "")

blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONN_STR)
container_client = blob_service_client.get_container_client(AZURE_CONTAINER)

def upload_to_blob(file_path: str) -> str:
    try:
        filename = f"{uuid.uuid4()}.pdf"
        blob_client = container_client.get_blob_client(filename)

        with open(file_path, "rb") as data:
            blob_client.upload_blob(
                data,
                overwrite=True,
                content_settings=ContentSettings(content_type="application/pdf")
            )

        # Generate SAS token valid for 7 days
        sas_token = generate_blob_sas(
            account_name=AZURE_ACCOUNT_NAME,
            container_name=AZURE_CONTAINER,
            blob_name=filename,
            account_key=AZURE_ACCOUNT_KEY,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(days=7),
        )

        # Construct SAS URL
        sas_url = f"https://{AZURE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_CONTAINER}/{filename}?{sas_token}"
        return sas_url

    except Exception as e:
        print(f"❌ Upload failed for {file_path}: {e}")
        return None
