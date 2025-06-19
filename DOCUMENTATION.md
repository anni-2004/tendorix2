# Tendorix - Complete Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [AI/ML Components](#aiml-components)
8. [Deployment Guide](#deployment-guide)
9. [Development Guide](#development-guide)
10. [Troubleshooting](#troubleshooting)

## System Overview

### Purpose
Tendorix is an AI-powered tender matching platform designed to connect companies with relevant tender opportunities using advanced machine learning algorithms and natural language processing.

### Key Components
- **Authentication System**: Secure user management with JWT
- **Profile Management**: Comprehensive company profile creation and editing
- **AI Matching Engine**: Semantic matching using transformer models
- **Document Processing**: Automated tender document analysis
- **Real-time Dashboard**: Interactive user interface for tender management

### Technology Stack Summary
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS + Radix UI
Backend: FastAPI + Python + MongoDB
AI/ML: Azure AI + Gemini AI + HuggingFace Transformers
Storage: Azure Blob Storage + MongoDB
Authentication: JWT + bcrypt
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
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  MongoDB        │  Azure Blob   │  AI Services              │
│  - Users        │  - Documents  │  - Document Intelligence  │
│  - Companies    │  - Files      │  - Gemini AI             │
│  - Tenders      │               │  - HuggingFace           │
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

4. **Upload Service** (`backend/routers/upload.py`)
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

## Backend Documentation

### Project Structure
```
backend/
├── main.py                 # FastAPI application entry point
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
│   └── upload.py          # File upload endpoints
├── services/
│   ├── basic_filter.py    # Basic filtering logic
│   ├── blob_uploader.py   # Azure Blob Storage integration
│   ├── eligibility_extractor.py  # Document processing
│   ├── eligibility_parser.py     # AI text parsing
│   ├── summarizer.py      # Document summarization
│   ├── tender_inserter.py # Database operations
│   └── tender_matcher.py  # Matching algorithms
└── pipelines/
    ├── manual_tender_upload.py    # Manual upload pipeline
    └── run_tender_matching.py     # Matching pipeline
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
│   └── tender-match-pro/page.tsx  # Profile form
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

State Management:
- User authentication state
- Profile completion status
- Tender data and matching results
- UI state (loading, errors, modals)

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
- Multi-select dropdown with search
- Custom option creation
- Keyboard navigation
- Accessibility support

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

### Cloud Deployment Options

#### AWS Deployment
```yaml
# ECS Task Definition
{
  "family": "tendorix-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/tendorix-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "MONGO_URI",
          "value": "mongodb://your-mongo-cluster"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/tendorix-backend",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Azure Deployment
```yaml
# Azure Container Instances
apiVersion: 2019-12-01
location: eastus
name: tendorix-app
properties:
  containers:
  - name: backend
    properties:
      image: tendorix/backend:latest
      ports:
      - port: 8000
        protocol: TCP
      environmentVariables:
      - name: MONGO_URI
        value: mongodb://your-cosmos-db
      resources:
        requests:
          cpu: 1.0
          memoryInGB: 2.0
  - name: frontend
    properties:
      image: tendorix/frontend:latest
      ports:
      - port: 3000
        protocol: TCP
      resources:
        requests:
          cpu: 0.5
          memoryInGB: 1.0
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: TCP
      port: 3000
    - protocol: TCP
      port: 8000
```

#### Google Cloud Deployment
```yaml
# Cloud Run Service
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: tendorix-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "100"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 80
      containers:
      - image: gcr.io/your-project/tendorix-backend
        ports:
        - containerPort: 8000
        env:
        - name: MONGO_URI
          value: mongodb://your-mongo-atlas
        resources:
          limits:
            cpu: 1000m
            memory: 2Gi
```

### Kubernetes Deployment

#### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tendorix-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tendorix-backend
  template:
    metadata:
      labels:
        app: tendorix-backend
    spec:
      containers:
      - name: backend
        image: tendorix/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: tendorix-secrets
              key: mongo-uri
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: tendorix-secrets
              key: secret-key
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: tendorix-backend-service
spec:
  selector:
    app: tendorix-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
```

#### Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tendorix-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: tendorix-frontend
  template:
    metadata:
      labels:
        app: tendorix-frontend
    spec:
      containers:
      - name: frontend
        image: tendorix/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://tendorix-backend-service"
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
          limits:
            cpu: 500m
            memory: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: tendorix-frontend-service
spec:
  selector:
    app: tendorix-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Environment Configuration

#### Production Environment Variables
```bash
# Backend Production Environment
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/tender_system
SECRET_KEY=your-super-secure-production-key
AZURE_DOC_INTEL_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOC_INTEL_KEY=your-production-key
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
GEMINI_API_KEY=your-production-gemini-key
HF_API_TOKEN=your-production-huggingface-token

# Frontend Production Environment
NEXT_PUBLIC_API_URL=https://api.tendorix.com
```

#### Security Considerations
- Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
- Enable HTTPS/TLS encryption
- Configure proper CORS policies
- Implement rate limiting
- Set up monitoring and logging
- Regular security audits and updates

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
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit environment files with your configuration
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

### Testing Strategy

#### Backend Testing
```python
# Unit Tests
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_user_registration():
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    assert response.status_code == 200
    assert "id" in response.json()

def test_tender_matching():
    # Test matching algorithm
    pass

# Integration Tests
def test_full_matching_pipeline():
    # Test complete workflow from profile creation to matching
    pass
```

#### Frontend Testing
```typescript
// Component Tests
import { render, screen, fireEvent } from '@testing-library/react';
import { TenderCard } from './TenderCard';

describe('TenderCard', () => {
  const mockTender = {
    id: '1',
    title: 'Test Tender',
    matching_score: 85.5
  };

  it('renders tender information correctly', () => {
    render(<TenderCard tender={mockTender} onSelect={jest.fn()} />);
    
    expect(screen.getByText('Test Tender')).toBeInTheDocument();
    expect(screen.getByText('85.5% Match')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<TenderCard tender={mockTender} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockTender);
  });
});

// E2E Tests
import { test, expect } from '@playwright/test';

test('complete user journey', async ({ page }) => {
  // Test full user workflow
  await page.goto('/');
  await page.click('text=Sign Up');
  await page.fill('[placeholder="Email"]', 'test@example.com');
  await page.fill('[placeholder="Password"]', 'testpass123');
  await page.click('button:has-text("Create Account")');
  
  // Continue testing workflow...
});
```

### Performance Optimization

#### Backend Optimization
```python
# Database Query Optimization
from pymongo import ASCENDING, TEXT

# Create indexes for better query performance
db.companies.create_index([
    ("businessCapabilities.industrySectors", TEXT),
    ("businessCapabilities.productServiceKeywords", TEXT)
])

# Use aggregation pipelines for complex queries
pipeline = [
    {"$match": {"business_category": {"$in": company_categories}}},
    {"$lookup": {
        "from": "companies",
        "localField": "matched_companies",
        "foreignField": "_id",
        "as": "company_details"
    }},
    {"$sort": {"matching_score": -1}},
    {"$limit": 50}
]

# Implement caching for frequently accessed data
from functools import lru_cache

@lru_cache(maxsize=128)
def get_company_profile(user_id: str):
    return companies.find_one({"user_id": user_id})
```

#### Frontend Optimization
```typescript
// Component Optimization
import { memo, useMemo, useCallback } from 'react';

export const TenderList = memo(({ tenders, onTenderSelect }) => {
  const sortedTenders = useMemo(() => 
    tenders.sort((a, b) => b.matching_score - a.matching_score),
    [tenders]
  );

  const handleTenderSelect = useCallback((tender) => {
    onTenderSelect(tender);
  }, [onTenderSelect]);

  return (
    <div>
      {sortedTenders.map(tender => (
        <TenderCard 
          key={tender.id} 
          tender={tender} 
          onSelect={handleTenderSelect}
        />
      ))}
    </div>
  );
});

// Data Fetching Optimization
import { useQuery } from '@tanstack/react-query';

export const useTenderData = (companyId: string) => {
  return useQuery({
    queryKey: ['tenders', companyId],
    queryFn: () => fetchTenders(companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
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

##### API Key Configuration
```bash
# Issue: Azure AI Document Intelligence authentication failed
# Solution: Verify environment variables
echo $AZURE_DOC_INTEL_ENDPOINT
echo $AZURE_DOC_INTEL_KEY

# Check key format and permissions
curl -H "Ocp-Apim-Subscription-Key: $AZURE_DOC_INTEL_KEY" \
     "$AZURE_DOC_INTEL_ENDPOINT/documentintelligence/documentModels/prebuilt-layout"
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

##### Form Validation Issues
```typescript
// Issue: Form not submitting
// Solution: Check validation schema
const result = registrationSchema.safeParse(formData);
if (!result.success) {
  console.log(result.error.issues);
}

// Check form state
console.log(form.formState.errors);
console.log(form.formState.isValid);
```

#### Deployment Issues

##### Docker Build Problems
```dockerfile
# Issue: Docker build fails
# Solution: Check Dockerfile syntax and dependencies

# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

##### Environment Variable Issues
```bash
# Issue: Environment variables not loaded
# Solution: Check variable names and values

# List all environment variables
printenv | grep TENDORIX

# Check Docker environment
docker exec -it container_name printenv

# Verify Kubernetes secrets
kubectl get secrets tendorix-secrets -o yaml
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
# Issue: High memory usage
# Solution: Implement pagination and streaming

from typing import Generator

def stream_tenders(batch_size: int = 100) -> Generator[dict, None, None]:
    skip = 0
    while True:
        batch = list(tenders.find().skip(skip).limit(batch_size))
        if not batch:
            break
        for tender in batch:
            yield tender
        skip += batch_size
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
        
        # Check external services
        # ... additional checks
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0"
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
- **Docker Documentation**: https://docs.docker.com/

---

This documentation is continuously updated. For the latest version, please check our [GitHub repository](https://github.com/your-username/tendorix).