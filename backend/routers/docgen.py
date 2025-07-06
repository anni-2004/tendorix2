import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from services.template_parser import extract_schema_from_docx
from services.doc_generator import generate_docx_from_template
from routers.auth import get_current_user

router = APIRouter()

TEMPLATE_DIR = "backend/storage/templates"
OUTPUT_DIR = "backend/storage/output"

os.makedirs(TEMPLATE_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@router.post("/upload-template/")
async def upload_template(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload and parse a document template"""
    file_ext = file.filename.split(".")[-1] if file.filename else ""
    if file_ext.lower() != "docx":
        raise HTTPException(status_code=400, detail="Only .docx files are allowed")

    template_id = str(uuid.uuid4())
    saved_path = os.path.join(TEMPLATE_DIR, f"{template_id}.docx")

    try:
        with open(saved_path, "wb") as f:
            content = await file.read()
            f.write(content)

        schema = extract_schema_from_docx(saved_path)
        if not schema:
            raise HTTPException(status_code=500, detail="Failed to parse schema from template")

        return {"templateId": template_id, "schema": schema}
    except Exception as e:
        # Clean up file if processing failed
        if os.path.exists(saved_path):
            os.remove(saved_path)
        raise HTTPException(status_code=500, detail=f"Template processing failed: {str(e)}")


@router.post("/generate-document/")
async def generate_document(
    templateId: str = Form(...),
    mappedData: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Generate a document from template and mapped data"""
    try:
        # Parse the mapped data
        import json
        mapped_data = json.loads(mappedData)
        
        template_path = os.path.join(TEMPLATE_DIR, f"{templateId}.docx")
        if not os.path.exists(template_path):
            raise HTTPException(status_code=404, detail="Template not found")

        # Extract schema to get template string
        schema = extract_schema_from_docx(template_path)
        if not schema:
            raise HTTPException(status_code=500, detail="Failed to extract template schema")

        template_string = schema["templateString"]
        output_path = os.path.join(OUTPUT_DIR, f"{templateId}_final.docx")
        
        # Generate the document
        generate_docx_from_template(template_string, mapped_data, output_path)

        return FileResponse(
            output_path, 
            filename="Generated_Document.docx", 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in mappedData")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")


@router.get("/tender/{tender_id}")
async def get_tender_data(tender_id: str, current_user: dict = Depends(get_current_user)):
    """Fetch tender data by Tender ID from MongoDB"""
    from core.database import db
    
    try:
        # Search in the tenders collection
        tender_data = db.tenders.find_one({"reference_number": tender_id})
        
        if not tender_data:
            # If not found, return mock data for demo purposes
            mock_data = {
                'Tender ID': tender_id,
                'Company Name': 'Demo Company Ltd.',
                'Tender Title': 'Supply of Essential Services',
                'EMD Amount': '₹25,000',
                'Tender Date': '2024-01-15',
                'Submission Deadline': '2024-02-15',
                'Contact Person': 'John Doe',
                'Phone': '+91-9876543210',
                'Email': 'john.doe@democompany.com',
                'Address': '123 Business District, Mumbai, Maharashtra 400001',
                'Bank Name': 'State Bank of India',
                'Account Number': '1234567890',
                'IFSC Code': 'SBIN0001234',
                'Registration Number': 'REG/2024/001',
                'GST Number': '27ABCDE1234F1Z5',
                'PAN Number': 'ABCDE1234F',
            }
            return mock_data
        
        # Remove MongoDB's _id field from response
        if '_id' in tender_data:
            del tender_data['_id']
        
        return tender_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tender data: {str(e)}")


@router.get("/tenders/")
async def list_tenders(limit: int = 10, skip: int = 0, current_user: dict = Depends(get_current_user)):
    """List all tenders with pagination"""
    from core.database import db
    
    try:
        # Get total count
        total = db.tenders.count_documents({})
        
        # Get paginated results
        tenders = list(db.tenders.find({}, {"_id": 0}).skip(skip).limit(limit))
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "tenders": tenders
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tenders: {str(e)}")


@router.get("/tender/{tender_id}/fields")
async def get_tender_fields(tender_id: str, current_user: dict = Depends(get_current_user)):
    """Get available fields for a specific tender"""
    from core.database import db
    
    try:
        tender_data = db.tenders.find_one({"reference_number": tender_id})
        
        if not tender_data:
            raise HTTPException(status_code=404, detail=f"Tender with ID '{tender_id}' not found")
        
        # Remove MongoDB's _id field
        if '_id' in tender_data:
            del tender_data['_id']
        
        # Return field names and sample values
        fields = {}
        for key, value in tender_data.items():
            fields[key] = {
                "type": type(value).__name__,
                "sample_value": str(value)[:100] if value else None  # Truncate long values
            }
        
        return {
            "tender_id": tender_id,
            "total_fields": len(fields),
            "fields": fields
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tender fields: {str(e)}")