from datetime import datetime
import uuid
import os
from models import ExtractedData, ValidationResult
from database import documents_collection

# Configuration du stockage local avec chemin absolu pour plus de fiabilité
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE_PATH = os.path.join(BASE_DIR, "datalake", "raw")

if not os.path.exists(STORAGE_PATH):
    os.makedirs(STORAGE_PATH, exist_ok=True)

async def save_to_datalake(filename: str, raw_content: bytes, extracted_data: ExtractedData, validation: ValidationResult, user_email: str):
    """
    Sauvegarde le document physiquement et dans MongoDB (Architecture Data Lake 3 zones).
    """
    document_uuid = str(uuid.uuid4())
    ext = filename.split('.')[-1] if '.' in filename else "bin"
    physical_filename = f"{document_uuid}.{ext}"
    physical_path = os.path.join(STORAGE_PATH, physical_filename)

    # Sauvegarde physique du fichier sur le disque
    with open(physical_path, "wb") as f:
        f.write(raw_content)
    
    document_entry = {
        "document_id": document_uuid,
        "uploaded_by": user_email,
        "upload_date": datetime.now().isoformat(),
   
        "raw_zone": {
            "filename": filename,
            "physical_path": physical_path,
            "file_type": ext,
        },
        
        "clean_zone": extracted_data.dict(),
        
        "curated_zone": {
            "document_type": extracted_data.type,
            "coherent": validation.coherent,
            "anomalie": validation.anomalie,
            "validation_timestamp": datetime.now().isoformat(),
            "status_final": "VERIFIE" if validation.coherent else "EN_ATTENTE" # Nouveaux statuts
        }
    }
    
    await documents_collection.insert_one(document_entry)
    return document_uuid