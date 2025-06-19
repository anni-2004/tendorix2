# Tendorix - AI-Powered Tender Matching Platform

![Tendorix Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=TENDORIX)

## 🚀 Overview

Tendorix is an intelligent tender matching platform that uses AI to connect companies with relevant government and private sector tenders. The platform analyzes company profiles and matches them with suitable tender opportunities using advanced algorithms and natural language processing.

## ✨ Features

### 🔐 Authentication System
- **Secure Login/Signup**: JWT-based authentication with bcrypt password hashing
- **Session Management**: Persistent login sessions with token validation
- **User Profile Management**: Complete user account management

### 🏢 Company Profile Management
- **Comprehensive Profile Creation**: Multi-step wizard for detailed company information
- **Dynamic Form Validation**: Real-time validation with user-friendly error messages
- **Profile Editing**: Update existing profiles with data persistence
- **Auto-save Functionality**: Form data automatically saved during completion

### 🎯 AI-Powered Tender Matching
- **Intelligent Filtering**: Advanced algorithms filter tenders based on company capabilities
- **Semantic Matching**: Uses sentence transformers for semantic similarity matching
- **Scoring System**: Provides matching scores for each tender opportunity
- **Eligibility Assessment**: Automated eligibility checking against tender requirements

### 📊 Tender Management
- **Comprehensive Database**: Large collection of government and private tenders
- **Real-time Updates**: Live tender data with automatic updates
- **Document Processing**: AI-powered document analysis and text extraction
- **Smart Categorization**: Automatic categorization of tenders by industry and type

### 🤖 AI Features
- **Document Intelligence**: Azure AI Document Intelligence for PDF processing
- **Text Summarization**: Gemini AI for intelligent tender summarization
- **Eligibility Extraction**: Automated extraction of eligibility criteria from tender documents
- **Natural Language Processing**: Advanced NLP for better matching accuracy

### 📱 Modern UI/UX
- **Responsive Design**: Works seamlessly across all devices
- **Modern Interface**: Clean, professional design with smooth animations
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Real-time Feedback**: Instant loading states and progress indicators

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT with PassLib
- **AI/ML**: 
  - Sentence Transformers for semantic matching
  - Azure AI Document Intelligence
  - Google Gemini AI for summarization
- **File Storage**: Azure Blob Storage
- **API Documentation**: Automatic OpenAPI/Swagger documentation

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Radix UI with Tailwind CSS
- **Form Management**: React Hook Form with Zod validation
- **State Management**: React hooks with local storage persistence
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Cloud Services**: Azure (Document Intelligence, Blob Storage)
- **Environment Management**: Environment variables with validation
- **Process Management**: Uvicorn ASGI server

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **Python**: Version 3.9 or higher
- **MongoDB**: Version 5.0 or higher
- **Docker**: Version 20.10 or higher (for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/tendorix.git
cd tendorix
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=tender_system

# Authentication
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Azure Services
AZURE_DOC_INTEL_ENDPOINT=your-azure-endpoint
AZURE_DOC_INTEL_KEY=your-azure-key
AZURE_STORAGE_CONNECTION_STRING=your-azure-storage-connection
AZURE_BLOB_CONTAINER=tender-documents
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
AZURE_STORAGE_ACCOUNT_KEY=your-storage-key

# AI Services
HF_API_TOKEN=your-huggingface-token
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profile Endpoints
- `POST /api/register` - Create/update company profile
- `GET /api/profile` - Get company profile

### Tender Endpoints
- `GET /api/tenders/summary` - Get tender statistics
- `POST /api/tenders/match` - Run tender matching
- `GET /api/tenders/{id}/summarize` - Get AI summary of tender

### Company Endpoints
- `GET /api/companies` - List all companies

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AI Services   │
                    │   - Azure AI    │
                    │   - Gemini AI   │
                    │   - HuggingFace │
                    └─────────────────┘
```

### Data Flow
1. **User Registration**: User creates account and fills company profile
2. **Tender Ingestion**: Tenders are processed and stored in database
3. **AI Processing**: Documents are analyzed using Azure AI Document Intelligence
4. **Matching Algorithm**: Semantic matching using sentence transformers
5. **Results Display**: Matched tenders displayed with scores and summaries

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm run test
```

### End-to-End Testing
```bash
npm run test:e2e
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment Options
- **AWS**: ECS, Lambda, RDS
- **Azure**: Container Instances, App Service, Cosmos DB
- **Google Cloud**: Cloud Run, Cloud SQL, Firestore
- **Vercel**: Frontend deployment with serverless functions

## 🔒 Security

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Configured CORS policies
- **Environment Variables**: Sensitive data stored in environment variables
- **API Rate Limiting**: Protection against abuse and DDoS attacks

### Security Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Secure API design patterns
- Data encryption in transit and at rest

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check our comprehensive documentation
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join our GitHub Discussions
- **Email**: support@tendorix.com

### Common Issues
- **Database Connection**: Ensure MongoDB is running and accessible
- **API Keys**: Verify all required API keys are configured
- **Port Conflicts**: Check if ports 3000 and 8000 are available

## 🗺️ Roadmap

### Upcoming Features
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Integration with more tender portals
- [ ] Machine learning model improvements
- [ ] Real-time notifications
- [ ] Bulk tender processing
- [ ] Advanced reporting features

## 📊 Performance

### Benchmarks
- **Response Time**: < 200ms for API calls
- **Matching Speed**: < 5 seconds for 1000+ tenders
- **Concurrent Users**: Supports 100+ concurrent users
- **Database Performance**: Optimized queries with indexing

## 🌟 Acknowledgments

- **Azure AI**: For document intelligence capabilities
- **Google Gemini**: For AI summarization features
- **HuggingFace**: For transformer models
- **MongoDB**: For flexible document storage
- **FastAPI**: For high-performance API framework
- **Next.js**: For modern React framework

---

**Built with ❤️ by the Tendorix Team**

For more information, visit our [website](https://tendorix.com) or follow us on [Twitter](https://twitter.com/tendorix).