# Tendorix - AI-Powered Tender Matching & Document Generation Platform

## 🚀 Overview

Tendorix is an intelligent tender matching platform that uses AI to connect companies with relevant government and private sector tenders. The platform combines advanced tender matching capabilities with AI-powered document generation.

## ✨ Key Features

- **🔐 Secure Authentication** - JWT-based user management
- **🏢 Company Profiling** - Comprehensive business profile creation
- **🎯 AI Tender Matching** - Intelligent tender discovery and scoring
- **📝 Document Generation** - AI-powered template processing and document creation
- **📊 Analytics Dashboard** - Performance tracking and insights
- **📱 Responsive Design** - Works seamlessly across all devices

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - Document database for flexible data storage
- **JWT Authentication** - Secure token-based authentication
- **AI Services** - Gemini AI, Azure Document Intelligence, HuggingFace

### Frontend
- **Next.js 14** - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **React Hook Form** - Form management with validation

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB 5.0+
- Docker (optional)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/tendorix.git
cd tendorix
```

### 2. Environment Setup
```bash
# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Profile Management
- `POST /api/register` - Create/update company profile
- `GET /api/profile` - Get company profile

### Tender Matching
- `GET /api/tenders/summary` - Get tender statistics
- `POST /api/tenders/match` - Run AI-powered matching
- `GET /api/tenders/{id}/summarize` - Get AI summary

### Document Generation
- `POST /api/docgen/upload-template/` - Upload template
- `POST /api/docgen/generate-document/` - Generate document
- `GET /api/docgen/tender/{id}` - Get tender data

## 🏗️ Project Structure

```
tendorix/
├── backend/
│   ├── core/           # Database and utilities
│   ├── models/         # Pydantic models
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic
│   └── main.py         # FastAPI application
├── frontend/
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   └── lib/            # Utilities and schemas
└── docker-compose.yml  # Container orchestration
```

## 🔧 Configuration

### Required Environment Variables
```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=tender_system
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test
```

## 🚀 Deployment

### Cloud Options
- **Vercel** - Frontend deployment
- **Railway/Render** - Backend deployment
- **MongoDB Atlas** - Database hosting
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive docs
- **Issues**: Report bugs on GitHub Issues
- **Email**: support@tendorix.com

---

**Built with ❤️ by the Tendorix Team**