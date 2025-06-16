from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Import routers from both systems
from routers import upload, company, match, profile, auth  # ← you will add auth.py

app = FastAPI()

# ✅ Enable CORS for React frontend (adjust for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Serve static files if needed
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Jinja templates if required
templates = Jinja2Templates(directory="templates")

# ✅ Include all routers
app.include_router(upload.router, prefix="/api")
app.include_router(company.router, prefix="/api")
app.include_router(match.router, prefix="/api")
app.include_router(profile.router, prefix="/api")  # from studio
app.include_router(auth.router, prefix="/api/auth")  # you will add this

@app.get("/")
def root():
    return {"message": "Unified Tender Matching + Company Profile Backend Running"}
