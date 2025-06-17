from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Import routers
from routers import upload, company, match, profile, auth

app = FastAPI(title="Tendorix API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files if needed
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except:
    pass  # Directory might not exist

# Jinja templates if required
try:
    templates = Jinja2Templates(directory="templates")
except:
    pass  # Directory might not exist

# Include all routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(match.router, prefix="/api", tags=["Matching"])
app.include_router(company.router, prefix="/api", tags=["Company"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])

@app.get("/")
def root():
    return {
        "message": "Tendorix API is running",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "profile": "/api",
            "matching": "/api",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}