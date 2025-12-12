from fastapi import FastAPI, APIRouter, HTTPException, Body
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager  # <-- Import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str
    role: str = "admin"

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    user: Optional[Dict[str, str]] = None
    message: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_type: str  # Old or New
    mr_number: Optional[str] = None
    patient_name: str
    mobile: str
    reference: str
    appointment_date: str
    token_number: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    synced: bool = False

class PatientRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Demographics
    mr_number: Optional[str] = None
    booking_type: str
    patient_name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    dob: Optional[str] = None
    mobile: str
    alternate_contact: Optional[str] = None
    address: Optional[Dict[str, str]] = None
    email: Optional[str] = None
    
    # Appointment Details
    appointment_date: str
    appointment_time: Optional[str] = None
    department: Optional[str] = None
    consulting_doctor: Optional[str] = None
    reference: str
    visit_type: Optional[str] = None
    company_insurance: Optional[Dict[str, str]] = None
    
    # Clinical Details
    chief_complaints: Optional[str] = None
    present_illness_history: Optional[str] = None
    past_medical_history: Optional[str] = None
    past_ocular_history: Optional[str] = None
    surgical_history: Optional[str] = None
    drug_history: Optional[str] = None
    allergy_history: Optional[str] = None
    
    # Nurse Assessment (Enhanced)
    vitals: Optional[Dict[str, Any]] = None # {bp, pulse, temp, spo2, rr}
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    nursing_notes: Optional[str] = None
    triage_level: Optional[str] = None
    
    # Refraction (New)
    auto_refraction: Optional[Dict[str, Any]] = None # {right: {sphere...}, left: ...}
    subjective_refraction: Optional[Dict[str, Any]] = None
    visual_acuity: Optional[Dict[str, Any]] = None # {right_unaided...}
    prescription: Optional[Dict[str, Any]] = None # {right: {...}, left: {...}, pd, lens_type, notes}
    
    # Ophthalmic Examination (New)
    external_exam: Optional[str] = None
    anterior_segment: Optional[str] = None
    iop: Optional[Dict[str, Any]] = None # {right: '', left: ''}
    pupillary_reactions: Optional[str] = None
    fundus_exam: Optional[str] = None
    slit_lamp: Optional[str] = None # Detailed notes or structured? Keeping string for flexibility or dict
    imaging_reports: Optional[str] = None
    
    # Investigations & Treatment
    diagnosis: Optional[Dict[str, Any]] = None # {primary, secondary}
    investigations: Optional[List[Dict[str, Any]]] = None
    medications: Optional[List[Dict[str, Any]]] = None
    procedures: Optional[List[Dict[str, Any]]] = None
    advice: Optional[str] = None
    follow_up_date: Optional[str] = None
    
    # Administrative
    consent_status: Optional[str] = None
    attending_nurse: Optional[str] = None
    attending_doctor: Optional[str] = None
    status: str = "Open"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    synced: bool = False

    synced: bool = False

class SyncRequest(BaseModel):
    bookings: Optional[List[Booking]] = None
    patients: Optional[List[PatientRecord]] = None

# ============ HELPERS ============

async def generate_mr_number():
    current_year = datetime.now().year
    
    # regex to find MR numbers for the current year: AFEH<digits>/<year>
    regex_pattern = f"^AFEH\\d+/{current_year}$"
    
    # Find the latest patient with this year's MR number
    # Sort by created_at descending to get the last one
    # Note: Sorting by string MR number might be tricky if lengths differ (AFEH9 vs AFEH10), 
    # but with leading zeros it's safer. Let's rely on finding all and parsing.
    
    cursor = db.patients.find({"mr_number": {"$regex": regex_pattern}})
    patients = await cursor.to_list(length=1000)
    
    max_seq = 0
    for p in patients:
        mr = p.get('mr_number')
        if mr:
            try:
                # Split AFEH001/2025 -> ["AFEH001", "2025"]
                # "AFEH001" -> "001"
                part1 = mr.split('/')[0]
                seq_str = part1.replace("AFEH", "")
                seq = int(seq_str)
                if seq > max_seq:
                    max_seq = seq
            except:
                continue
                
    new_seq = max_seq + 1
    # Format: AFEH001/2025
    return f"AFEH{new_seq:03d}/{current_year}"



# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Ahalia Eye Hospital API"}

# Auth
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Hardcoded users for RBAC
    USERS = {
        "admin": {"password": "admin123", "role": "admin", "id": "1"},
        "nurse": {"password": "nurse123", "role": "nurse", "id": "2"},
        "doctor": {"password": "doctor123", "role": "doctor", "id": "3"}
    }
    
    user = USERS.get(request.username)
    if user and user['password'] == request.password:
        return LoginResponse(
            success=True,
            user={"id": user['id'], "username": request.username, "role": user['role']},
            message="Login successful"
        )
    return LoginResponse(success=False, message="Invalid credentials")

# Bookings
@api_router.get("/appointments", response_model=List[Booking])
async def get_bookings():
    # Sort creation descending
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.post("/appointments", response_model=Booking)
async def create_booking(booking: Booking):
    doc = booking.model_dump()
    await db.bookings.insert_one(doc)
    return booking

@api_router.put("/appointments/{booking_id}", response_model=Booking)
async def update_booking(booking_id: str, booking: Booking):
    doc = booking.model_dump()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.bookings.update_one({"id": booking_id}, {"$set": doc}, upsert=True)
    return booking

# Patients (Full Clinical Records)
@api_router.get("/patients", response_model=List[PatientRecord])
async def get_patients():
    patients = await db.patients.find({}, {"_id": 0}).to_list(1000)
    return patients

@api_router.get("/patients/{patient_id}", response_model=PatientRecord)
async def get_patient(patient_id: str):
    patient = await db.patients.find_one({"id": patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@api_router.post("/patients", response_model=PatientRecord)
async def create_patient(patient: PatientRecord):
    # Generate MR Number if not provided
    if not patient.mr_number:
        patient.mr_number = await generate_mr_number()
        
    doc = patient.model_dump()
    await db.patients.insert_one(doc)
    return patient

@api_router.get("/patients/search", response_model=List[PatientRecord])
async def search_patients(query: str):
    if not query:
        return []
    
    # Search by MR Number (exact or partial) or Mobile or Name
    regex_query = {"$regex": query, "$options": "i"}
    
    # Construct search filter
    search_filter = {
        "$or": [
            {"mr_number": regex_query},
            {"mobile": regex_query},
            {"patient_name": regex_query}
        ]
    }
    
    patients = await db.patients.find(search_filter, {"_id": 0}).to_list(10)
    return patients

@api_router.put("/patients/{patient_id}", response_model=PatientRecord)
async def update_patient(patient_id: str, patient: PatientRecord):
    doc = patient.model_dump()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.patients.update_one({"id": patient_id}, {"$set": doc}, upsert=True)
    return patient

@api_router.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str):
    result = await db.patients.delete_one({"id": patient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted successfully"}

# Batch Sync
@api_router.post("/sync")
async def sync_data(sync_request: SyncRequest):
    results = {"bookings": 0, "patients": 0}
    
    if sync_request.bookings:
        for booking in sync_request.bookings:
            doc = booking.model_dump()
            await db.bookings.update_one({"id": booking.id}, {"$set": doc}, upsert=True)
            results["bookings"] += 1
    
    if sync_request.patients:
        for patient in sync_request.patients:
            doc = patient.model_dump()
            doc['updated_at'] = datetime.now(timezone.utc).isoformat()
            await db.patients.update_one({"id": patient.id}, {"$set": doc}, upsert=True)
            results["patients"] += 1
    
    return {"success": True, "synced": results}

# Add the lifespan context manager for shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic (if you have any)
    yield
    # Shutdown logic (close MongoDB client)
    client.close()

# Use the lifespan function with FastAPI
app = FastAPI(lifespan=lifespan)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
