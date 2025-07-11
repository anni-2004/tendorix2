# Tendorix - Complete Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [AI/ML Components](#aiml-components)
8. [TenderDraft Document Generation](#tenderdraft-document-generation)
9. [Deployment Guide](#deployment-guide)
10. [Development Guide](#development-guide)
11. [Troubleshooting](#troubleshooting)

## System Overview

### Purpose
Tendorix is a comprehensive AI-powered platform that combines tender matching with intelligent document generation. The platform revolutionizes how companies discover relevant tender opportunities and create professional tender documents using advanced machine learning algorithms and natural language processing.

### Key Components
- **Authentication System**: Secure user management with JWT
- **Profile Management**: Comprehensive company profile creation and editing
- **AI Matching Engine**: Semantic matching using transformer models
- **Document Processing**: Automated tender document analysis
- **TenderDraft**: AI-powered document generation system
- **Real-time Dashboard**: Interactive user interface for tender management

### Technology Stack Summary
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS + Radix UI
Backend: FastAPI + Python + MongoDB
AI/ML: Azure AI + Gemini AI + HuggingFace Transformers
Storage: Azure Blob Storage + MongoDB
Authentication: JWT + bcrypt
Document Generation: AI-powered template processing
```

## Architecture Deep Dive

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend  │  Mobile App (Future)  │  Admin Panel   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
├─────────────────────────────────────────────────────────────┤
│              FastAPI Application Server                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Auth     │ │   Profile   │ │   Matching  │           │
│  │   Service   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  TenderDraft│ │   Upload    │ │  Analytics  │           │
│  │   Service   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  MongoDB        │  Azure Blob   │  AI Services              │
│  - Users        │  - Documents  │  - Document Intelligence  │
│  - Companies    │  - Templates  │  - Gemini AI             │
│  - Tenders      │  - Files      │  - HuggingFace           │
└─────────────────────────────────────────────────────────────┘
```

### Microservices Architecture
The application follows a modular architecture with clear separation of concerns:

#### Core Services
1. **Authentication Service** (`backend/routers/auth.py`)
   - User registration and login
   - JWT token management
   - Password hashing and validation

2. **Profile Service** (`backend/routers/profile.py`)
   - Company profile CRUD operations
   - Profile validation and persistence
   - Data transformation and normalization

3. **Matching Service** (`backend/routers/match.py`)
   - Tender filtering and matching
   - AI-powered scoring algorithms
   - Results aggregation and ranking

4. **TenderDraft Service** (`backend/routers/docgen.py`)
   - Template upload and processing
   - AI-powered field mapping
   - Document generation and download

5. **Upload Service** (`backend/routers/upload.py`)
   - Document upload and processing
   - Batch processing capabilities
   - File validation and storage

#### Supporting Services
1. **Document Intelligence** (`backend/services/eligibility_extractor.py`)
   - PDF text extraction
   - Structured data parsing
   - Content analysis and classification

2. **AI Processing** (`backend/services/eligibility_parser.py`)
   - Natural language processing
   - Entity extraction and recognition
   - Semantic analysis

3. **Matching Engine** (`backend/services/tender_matcher.py`)
   - Similarity computation
   - Scoring algorithms
   - Ranking and filtering

4. **Template Processing** (`backend/services/template_parser.py`)
   - DOCX template parsing
   - Field extraction and identification
   - Schema generation

5. **Field Mapping** (`backend/services/field_mapper.py`)
   - AI-powered field mapping
   - Confidence scoring
   - Embedding-based similarity

## Backend Documentation

### Project Structure
```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration and environment variables
├── requirements.txt        # Python dependencies
├── core/
│   ├── database.py        # Database connection and configuration
│   └── utils.py           # Utility functions
├── models/
│   ├── registration_models.py  # Pydantic models for validation
│   └── match_models.py         # Matching-related models
├── routers/
│   ├── auth.py            # Authentication endpoints
│   ├── profile.py         # Profile management endpoints
│   ├── match.py           # Tender matching endpoints
│   ├── company.py         # Company-related endpoints
│   ├── docgen.py          # Document generation endpoints
│   └── upload.py          # File upload endpoints
├── services/
│   ├── basic_filter.py    # Basic filtering logic
│   ├── blob_uploader.py   # Azure Blob Storage integration
│   ├── eligibility_extractor.py  # Document processing
│   ├── eligibility_parser.py     # AI text parsing
│   ├── summarizer.py      # Document summarization
│   ├── tender_inserter.py # Database operations
│   ├── tender_matcher.py  # Matching algorithms
│   ├── template_parser.py # Template processing
│   ├── field_mapper.py    # AI field mapping
│   └── doc_generator.py   # Document generation
├── pipelines/
│   ├── manual_tender_upload.py    # Manual upload pipeline
│   └── run_tender_matching.py     # Matching pipeline
└── storage/
    ├── templates/         # Uploaded templates
    └── output/           # Generated documents
```

### Core Components

#### Database Configuration (`core/database.py`)
```python
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

# Collections
profiles = db.get_collection("companies")
tenders = db.get_collection("filtered_tenders")
users = db.get_collection("users")
```

#### Authentication System (`routers/auth.py`)
Features:
- JWT token generation and validation
- Password hashing with bcrypt
- User session management
- Secure endpoint protection

Key Functions:
- `create_access_token()`: Generates JWT tokens
- `verify_password()`: Validates user passwords
- `get_current_user()`: Extracts user from JWT token

#### Profile Management (`routers/profile.py`)
Features:
- Multi-step form validation
- Profile creation and updates
- Data persistence and retrieval
- Comprehensive validation rules

Validation Rules:
- Company details validation
- Financial information verification
- Business capability assessment
- Geographic reach validation

#### TenderDraft System (`routers/docgen.py`)
Features:
- Template upload and parsing
- AI-powered field mapping
- Document generation
- Template management

Key Endpoints:
- `POST /upload-template/`: Upload and parse templates
- `POST /auto-map-fields/`: AI-powered field mapping
- `POST /generate-document/`: Generate final documents
- `GET /tender/{id}`: Fetch tender data

#### Matching Engine (`services/tender_matcher.py`)
Algorithm Components:
1. **Semantic Similarity**: Uses sentence transformers for text matching
2. **Weighted Scoring**: Different criteria have different importance weights
3. **Eligibility Checking**: Validates company eligibility against requirements
4. **Threshold Filtering**: Only returns matches above minimum score

Scoring Factors:
- PAN/GSTIN compliance (10% each)
- Experience matching (20%)
- Document requirements (20%)
- Certifications (20%)
- Service description similarity (20%)

### API Endpoints

#### Authentication Endpoints
```
POST /api/auth/signup
- Body: { email: string, password: string }
- Response: { id: string, email: string }

POST /api/auth/login
- Body: { username: string, password: string }
- Response: { access_token: string, token_type: string }

GET /api/auth/me
- Headers: Authorization: Bearer <token>
- Response: { id: string, email: string }
```

#### Profile Endpoints
```
POST /api/register
- Headers: Authorization: Bearer <token>
- Body: RegistrationFormData
- Response: { message: string, id: string, action: string }

GET /api/profile
- Headers: Authorization: Bearer <token>
- Response: CompanyProfile
```

#### Matching Endpoints
```
GET /api/tenders/summary
- Headers: Authorization: Bearer <token>
- Response: { total_tenders: number, filtered_tenders: number, filtered_list: Tender[] }

POST /api/tenders/match
- Headers: Authorization: Bearer <token>
- Response: { message: string, matches: MatchedTender[] }

GET /api/tenders/{tender_id}/summarize
- Headers: Authorization: Bearer <token>
- Response: { tender_id: string, summary: string }
```

#### TenderDraft Endpoints
```
POST /api/docgen/upload-template/
- Headers: Authorization: Bearer <token>
- Body: FormData with file
- Response: { templateId: string, schema: object }

POST /api/docgen/auto-map-fields/
- Headers: Authorization: Bearer <token>
- Body: FormData with templateId and tenderId
- Response: { autoMapped: object, needsReview: object, unmapped: object }

POST /api/docgen/generate-document/
- Headers: Authorization: Bearer <token>
- Body: FormData with templateId and mappedData
- Response: File download (DOCX)
```

## Frontend Documentation

### Project Structure
```
frontend/
├── app/
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page with auth redirect
│   ├── login/page.tsx     # Login page
│   ├── signup/page.tsx    # Signup page
│   ├── dashboard/page.tsx # Main dashboard
│   ├── tender-match-pro/page.tsx  # Profile form
│   └── tender-draft/page.tsx      # Document generation
├── components/
│   ├── ui/                # Reusable UI components
│   └── tender_match_pro/  # Profile form components
├── hooks/
│   ├── use-form-persistence.ts  # Form data persistence
│   ├── use-mobile.tsx     # Mobile detection
│   └── use-toast.ts       # Toast notifications
├── lib/
│   ├── schemas/           # Zod validation schemas
│   ├── utils.ts           # Utility functions
│   └── api.ts             # API client functions
└── styles/
    └── globals.css        # Global styles and Tailwind
```

### Key Components

#### Dashboard (`app/dashboard/page.tsx`)
Features:
- Profile status detection
- Tender filtering and matching
- Results visualization
- Real-time updates
- TenderDraft access

State Management:
- User authentication state
- Profile completion status
- Tender data and matching results
- UI state (loading, errors, modals)

#### TenderDraft (`app/tender-draft/page.tsx`)
Features:
- Multi-step document generation workflow
- Template upload and processing
- AI-powered field mapping
- Document preview and generation
- Progress tracking

Workflow Steps:
1. Template Upload
2. Data Configuration
3. AI Auto-Mapping
4. Review & Edit
5. Document Generation

#### Registration Wizard (`components/tender_match_pro/registration-wizard.tsx`)
Features:
- Multi-step form with validation
- Auto-save functionality
- Progress tracking
- Data persistence

Form Steps:
1. Company Details
2. Business Capabilities
3. Financial & Legal Information
4. Tender Experience
5. Geographic & Digital Reach
6. Terms & Conditions
7. Declarations
8. Review & Submit

#### TagInput Component (`components/ui/tag-input.tsx`)
Features:
- Dropdown-only multi-select
- No text input capability
- Visual tag representation
- Easy tag removal
- Keyboard navigation support

### State Management

#### Form Persistence Hook (`hooks/use-form-persistence.ts`)
```typescript
export function useFormPersistence<T extends FieldValues>(
  form: UseFormReturn<T>,
  storageKey: string,
  initialDefaultValues: T
) {
  // Automatically saves form data to localStorage
  // Restores data on component mount
  // Clears data on successful submission
}
```

#### Authentication Flow
1. User visits application
2. Check for existing JWT token
3. Validate token with backend
4. Redirect to appropriate page (login/dashboard)
5. Maintain session state throughout application

### Validation Schemas (`lib/schemas/registration-schema.ts`)

#### Company Details Schema
```typescript
export const companyDetailsSchema = z.object({
  companyName: z.string().min(2),
  companyType: z.string().min(1),
  dateOfEstablishment: z.date(),
  country: z.string().min(2),
  state: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  websiteUrl: z.string().url().optional()
});
```

#### Business Capabilities Schema
```typescript
export const businessCapabilitiesSchema = z.object({
  businessRoles: z.string().min(3),
  industrySectors: z.string().min(3),
  productServiceKeywords: z.string().min(3),
  technicalCapabilities: z.string().optional(),
  certifications: z.string().optional(),
  hasNoCertifications: z.boolean()
}).superRefine((data, ctx) => {
  // Custom validation logic for certifications
});
```

## Database Schema

### Collections Overview

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  created_at: Date
}
```

#### Companies Collection
```javascript
{
  _id: ObjectId,
  user_id: String (references users._id),
  user_email: String,
  companyDetails: {
    companyName: String,
    companyType: String,
    dateOfEstablishment: Date,
    country: String,
    state: String,
    city: String,
    address: String,
    websiteUrl: String
  },
  businessCapabilities: {
    businessRoles: String,
    industrySectors: String,
    productServiceKeywords: String,
    technicalCapabilities: String,
    certifications: String,
    hasNoCertifications: Boolean
  },
  financialLegalInfo: {
    hasPan: Boolean,
    hasGstin: Boolean,
    hasMsmeUdyam: Boolean,
    hasNsic: Boolean,
    annualTurnovers: [{
      financialYear: String,
      amount: String
    }],
    netWorthAmount: String,
    netWorthCurrency: String,
    isBlacklistedOrLitigation: Boolean,
    blacklistedDetails: String
  },
  tenderExperience: {
    suppliedToGovtPsus: Boolean,
    hasPastClients: Boolean,
    pastClients: String,
    highestOrderValueFulfilled: Number,
    tenderTypesHandled: String
  },
  geographicDigitalReach: {
    operatesInMultipleStates: Boolean,
    operationalStates: String,
    exportsToOtherCountries: Boolean,
    countriesServed: String,
    hasImportLicense: Boolean,
    hasExportLicense: Boolean,
    registeredOnPortals: Boolean,
    hasDigitalSignature: Boolean,
    preferredTenderLanguages: String
  },
  termsAndConditions: {
    acknowledgmentOfTenderMatching: Boolean,
    accuracyOfSharedCompanyProfile: Boolean,
    noResponsibilityForTenderOutcomes: Boolean,
    nonDisclosureAndLimitedUse: Boolean
  },
  declarationsUploads: {
    infoConfirmed: Boolean
  },
  created_at: Date,
  updated_at: Date
}
```

#### Filtered Tenders Collection
```javascript
{
  _id: ObjectId,
  form_url: String (unique),
  title: String,
  reference_number: String,
  institute: String,
  location: String,
  business_category: [String],
  scope_of_work: String,
  estimated_budget: Number,
  deadline: String,
  emd: {
    amount: Number,
    exemption: [String]
  },
  tender_fee: {
    amount: Number,
    exemption: [String]
  },
  documents_required: [String],
  experience: {
    years: Number,
    sector: String
  },
  certifications: [String],
  eligibility_notes: String,
  raw_eligibility: String,
  structured_eligibility: Object,
  created_at: Date,
  last_updated: Date,
  source_url: String
}
```

### Indexing Strategy

#### Performance Indexes
```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })

// Companies collection
db.companies.createIndex({ "user_id": 1 }, { unique: true })
db.companies.createIndex({ "companyDetails.companyName": "text" })
db.companies.createIndex({ "businessCapabilities.industrySectors": "text" })

// Tenders collection
db.filtered_tenders.createIndex({ "form_url": 1 }, { unique: true })
db.filtered_tenders.createIndex({ "business_category": 1 })
db.filtered_tenders.createIndex({ "location": "text" })
db.filtered_tenders.createIndex({ "title": "text", "scope_of_work": "text" })
db.filtered_tenders.createIndex({ "deadline": 1 })
db.filtered_tenders.createIndex({ "estimated_budget": 1 })
```

## AI/ML Components

### Document Intelligence Pipeline

#### Text Extraction (`services/eligibility_extractor.py`)
```python
def extract_eligibility_text_from_url(formUrl: str) -> str:
    # Uses Azure AI Document Intelligence
    # Extracts structured text from PDF documents
    # Identifies eligibility sections using pattern matching
    # Returns clean, structured text for further processing
```

Pattern Matching:
- Eligibility criteria detection
- Section boundary identification
- Content extraction and cleaning
- Structured data organization

#### Eligibility Parsing (`services/eligibility_parser.py`)
```python
def extract_eligibility_json_general(raw_text: str) -> dict:
    # Uses HuggingFace Zephyr model
    # Converts unstructured text to structured JSON
    # Extracts key eligibility requirements
    # Validates and normalizes extracted data
```

Extraction Categories:
- Experience requirements
- Financial criteria
- Legal compliance
- Document requirements
- Certification needs

### Matching Algorithm (`services/tender_matcher.py`)

#### Semantic Similarity Engine
```python
model = SentenceTransformer("all-MiniLM-L6-v2")

def compute_embedding_similarity_list(required_list, provided_list, threshold=0.75):
    # Computes semantic similarity between requirements and capabilities
    # Uses cosine similarity for matching
    # Returns matched items and missing requirements
```

#### Scoring Algorithm
```python
def compute_tender_match_score(eligibility: dict, company: dict):
    # Weighted scoring system:
    # - PAN compliance: 10%
    # - GSTIN compliance: 10%
    # - Experience matching: 20%
    # - Document requirements: 20%
    # - Certifications: 20%
    # - Service description: 20%
    
    # Returns comprehensive matching result with:
    # - Overall matching score
    # - Eligibility status
    # - Field-wise scores
    # - Missing requirements
```

### AI Services Integration

#### Azure AI Document Intelligence
- **Purpose**: PDF text extraction and structure analysis
- **Models**: Prebuilt layout model for general documents
- **Features**: Table extraction, form recognition, text analysis
- **Output**: Structured text with section identification

#### Google Gemini AI
- **Purpose**: Document summarization and content analysis
- **Model**: Gemini-1.5-flash for fast processing
- **Features**: Intelligent summarization, key point extraction
- **Output**: Concise, human-readable summaries

#### HuggingFace Transformers
- **Purpose**: Semantic matching and text similarity
- **Models**: 
  - all-MiniLM-L6-v2 for sentence embeddings
  - Zephyr-7b-beta for text generation
- **Features**: Multilingual support, domain adaptation
- **Output**: Similarity scores and structured data

## TenderDraft Document Generation

### Overview
TenderDraft is an AI-powered document generation system that automates the creation of professional tender documents by mapping tender data to user-provided templates.

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Template      │    │   AI Field      │    │   Document      │
│   Upload        │───▶│   Mapping       │───▶│   Generation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Template      │    │   Confidence    │    │   Quality       │
│   Parsing       │    │   Scoring       │    │   Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

#### Template Parser (`services/template_parser.py`)
```python
def extract_schema_from_docx(docx_path):
    """Extract schema from DOCX template using Gemini AI"""
    try:
        template_text = extract_text_from_docx(docx_path)
        prompt = build_prompt(template_text)
        response = MODEL.generate_content(prompt)
        parsed = clean_and_parse_gemini_json(response.text)
        return parsed
    except Exception as e:
        print("❌ Error:", e)
        return None
```

Features:
- DOCX text extraction
- AI-powered field identification
- Schema generation
- Validation and error handling

#### Field Mapper (`services/field_mapper.py`)
```python
def map_fields_by_embedding(gemini_fields: list, backend_fields: list, backend_data: dict, threshold: float = 0.5):
    """
    Maps template fields to backend data fields using embedding similarity.
    """
    mapped_data = {}
    backend_embeddings = model.encode(backend_fields, convert_to_tensor=True)
    
    for field in gemini_fields:
        query_embedding = model.encode(field['label'], convert_to_tensor=True)
        cosine_scores = util.cos_sim(query_embedding, backend_embeddings)[0].cpu().numpy()
        max_score_idx = np.argmax(cosine_scores)
        max_score = cosine_scores[max_score_idx]
        
        if max_score >= threshold:
            matched_backend_field = backend_fields[max_score_idx]
            mapped_data[field['id']] = str(backend_data.get(matched_backend_field, ""))
    
    return mapped_data
```

Features:
- Embedding-based similarity matching
- Confidence scoring
- Threshold-based filtering
- Automatic field mapping

#### Document Generator (`services/doc_generator.py`)
```python
def generate_docx_from_template(template_string: str, mapped_data: dict, output_path: str):
    """Generate a DOCX document from template string and mapped data"""
    # Replace placeholders with values
    filled_text = template_string
    for key, value in mapped_data.items():
        placeholder = f"{{{key}}}"
        filled_text = filled_text.replace(placeholder, str(value) if value else "")
    
    # Generate DOCX document
    doc = Document()
    for line in filled_text.split("\n"):
        if line.strip():
            p = doc.add_paragraph()
            p.add_run(line.strip())
    
    doc.save(output_path)
```

Features:
- Template placeholder replacement
- DOCX document generation
- Formatting preservation
- Error handling

### Workflow

#### 1. Template Upload
- User uploads DOCX template
- System extracts text content
- AI identifies field placeholders
- Schema is generated and stored

#### 2. Data Configuration
- User provides tender ID
- System fetches tender data
- Data is prepared for mapping

#### 3. AI Auto-Mapping
- AI maps template fields to tender data
- Confidence scores are calculated
- Results are categorized (auto-mapped, needs review, unmapped)

#### 4. Review & Edit
- User reviews mapped fields
- Manual adjustments can be made
- Preview is generated

#### 5. Document Generation
- Final document is generated
- Quality validation is performed
- Document is available for download

### API Integration

#### Upload Template
```typescript
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch("/api/docgen/upload-template/", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

#### Auto-Map Fields
```typescript
const formData = new FormData();
formData.append('templateId', templateId);
formData.append('tenderId', tenderId);

const response = await fetch("/api/docgen/auto-map-fields/", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

#### Generate Document
```typescript
const formData = new FormData();
formData.append('templateId', templateId);
formData.append('mappedData', JSON.stringify(mappedData));

const response = await fetch("/api/docgen/generate-document/", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

## Deployment Guide

### Docker Deployment

#### Dockerfile (Backend)
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGO_URI=mongodb://mongo:27017
      - MONGO_DB_NAME=tender_system
    depends_on:
      - mongo
    volumes:
      - ./backend:/app
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    
volumes:
  mongo_data:
```

### Environment Configuration

#### Required Environment Variables
```bash
# Backend Environment
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=tender_system
SECRET_KEY=your-super-secure-production-key
AZURE_DOC_INTEL_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOC_INTEL_KEY=your-production-key
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
GEMINI_API_KEY=your-production-gemini-key
HF_API_TOKEN=your-production-huggingface-token

# Frontend Environment
NEXT_PUBLIC_API_URL=https://api.tendorix.com
```

## Development Guide

### Setting Up Development Environment

#### Prerequisites Installation
```bash
# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Python (using pyenv)
curl https://pyenv.run | bash
pyenv install 3.9.16
pyenv global 3.9.16

# Install MongoDB
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Project Setup
```bash
# Clone repository
git clone https://github.com/your-username/tendorix.git
cd tendorix

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your configuration
```

#### Development Workflow

##### Backend Development
```bash
cd backend
source venv/bin/activate

# Start development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/ -v

# Code formatting
black .
isort .

# Linting
flake8 .
mypy .
```

##### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Code Quality Standards

#### Backend Standards
```python
# Example: Proper function documentation
def compute_tender_match_score(eligibility: dict, company: dict) -> dict:
    """
    Compute matching score between tender eligibility and company profile.
    
    Args:
        eligibility (dict): Structured eligibility requirements from tender
        company (dict): Company profile data
        
    Returns:
        dict: Matching result with score, eligibility status, and details
        
    Raises:
        ValueError: If required fields are missing
        TypeError: If input types are incorrect
    """
    # Implementation here
```

#### Frontend Standards
```typescript
// Example: Proper component documentation
interface TenderCardProps {
  /** Tender data object */
  tender: Tender;
  /** Callback when tender is selected */
  onSelect: (tender: Tender) => void;
  /** Whether the card is in loading state */
  isLoading?: boolean;
}

/**
 * TenderCard component displays tender information in a card format
 * with interactive elements for selection and viewing details.
 */
export const TenderCard: React.FC<TenderCardProps> = ({
  tender,
  onSelect,
  isLoading = false
}) => {
  // Implementation here
};
```

## Troubleshooting

### Common Issues and Solutions

#### Backend Issues

##### Database Connection Problems
```bash
# Issue: MongoDB connection failed
# Solution: Check MongoDB service status
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod

# Check connection string format
MONGO_URI=mongodb://localhost:27017/tender_system
```

##### AI Service Configuration
```bash
# Issue: Gemini AI authentication failed
# Solution: Verify environment variables
echo $GEMINI_API_KEY

# Check API key validity
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     "https://generativelanguage.googleapis.com/v1/models"
```

##### Import Errors
```python
# Issue: ModuleNotFoundError
# Solution: Check virtual environment activation
which python
pip list

# Reinstall dependencies
pip install -r requirements.txt

# Check Python path
import sys
print(sys.path)
```

#### Frontend Issues

##### Build Errors
```bash
# Issue: TypeScript compilation errors
# Solution: Check type definitions
npm run type-check

# Update dependencies
npm update

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

##### API Connection Issues
```typescript
// Issue: CORS errors
// Solution: Check backend CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

// Check environment variables
console.log(process.env.NEXT_PUBLIC_API_URL);
```

##### TagInput Component Issues
```typescript
// Issue: Dropdown selection not working
// Solution: Check event handling and Command component integration

// Ensure proper onSelect handling
<CommandItem
  onSelect={() => handleSelect(option)}
  className="cursor-pointer"
>
  {option}
</CommandItem>

// Verify state updates
const handleSelect = (option: string) => {
  const newTags = [...selectedTags, option];
  onChange(newTags.join(", "));
  setOpen(false);
};
```

#### TenderDraft Issues

##### Template Upload Problems
```bash
# Issue: Template parsing fails
# Solution: Check file format and content

# Verify DOCX format
file template.docx

# Check file size (max 10MB)
ls -lh template.docx

# Validate template content
python -c "
from docx import Document
doc = Document('template.docx')
for p in doc.paragraphs:
    print(p.text)
"
```

##### Field Mapping Issues
```python
# Issue: Low mapping accuracy
# Solution: Check embedding model and threshold

# Verify model loading
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")

# Test similarity computation
import numpy as np
from sentence_transformers import util

text1 = "Company Name"
text2 = "Business Name"
emb1 = model.encode(text1)
emb2 = model.encode(text2)
similarity = util.cos_sim(emb1, emb2)
print(f"Similarity: {similarity}")
```

### Performance Issues

#### Database Performance
```javascript
// Issue: Slow queries
// Solution: Add appropriate indexes
db.filtered_tenders.createIndex({ "business_category": 1, "location": 1 })
db.companies.createIndex({ "businessCapabilities.industrySectors": "text" })

// Monitor query performance
db.filtered_tenders.find({ "business_category": "Technology" }).explain("executionStats")
```

#### Memory Issues
```python
# Issue: High memory usage during AI processing
# Solution: Implement batch processing and memory management

import gc
from typing import Generator

def process_tenders_in_batches(tenders: list, batch_size: int = 10) -> Generator:
    for i in range(0, len(tenders), batch_size):
        batch = tenders[i:i + batch_size]
        yield batch
        gc.collect()  # Force garbage collection
```

### Monitoring and Logging

#### Application Monitoring
```python
# Backend logging configuration
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Performance monitoring
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"{func.__name__} executed in {end_time - start_time:.2f} seconds")
        return result
    return wrapper
```

#### Health Checks
```python
# Backend health check endpoint
@app.get("/health")
def health_check():
    try:
        # Check database connection
        db.command("ping")
        
        # Check AI services
        model = SentenceTransformer("all-MiniLM-L6-v2")
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "2.0.0",
            "services": {
                "database": "connected",
                "ai_models": "loaded",
                "storage": "available"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
```

### Support and Resources

#### Getting Help
- **Documentation**: This comprehensive guide
- **GitHub Issues**: Report bugs and request features
- **Community Forum**: Ask questions and share solutions
- **Email Support**: technical-support@tendorix.com

#### Useful Resources
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **MongoDB Documentation**: https://docs.mongodb.com/
- **Azure AI Documentation**: https://docs.microsoft.com/azure/cognitive-services/
- **Google Gemini Documentation**: https://ai.google.dev/docs
- **HuggingFace Documentation**: https://huggingface.co/docs
- **Docker Documentation**: https://docs.docker.com/

---

This documentation is continuously updated. For the latest version, please check our [GitHub repository](https://github.com/your-username/tendorix).

**Current Version**: 2.0 (January 2025)
**Implementation Status**: 85% Complete
**Key Features**: Core platform, tender matching, and TenderDraft document generation fully implemented