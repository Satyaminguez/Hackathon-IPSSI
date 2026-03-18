import motor.motor_asyncio
from datetime import datetime
import uuid
from models import ExtractedData, ValidationResult

MONGO_DETAILS = "mongodb://localhost:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client.db_docs
documents_collection = database.get_collection("documents_collection")

async def save_to_datalake(filename: str, raw_content: bytes, extracted_data: ExtractedData, validation: ValidationResult, user_email: str):
    """
    Sauvegarde le document dans MongoDB en suivant l'architecture Data Lake (3 zones).
    """
    document_id = str(uuid.uuid4())
    
    document_entry = {
        "document_id": document_id,
        "uploaded_by": user_email,
        "upload_date": datetime.now().isoformat(),
   
        "raw_zone": {
            "filename": filename,
            "file_type": filename.split('.')[-1] if '.' in filename else "unknown",
            
        },
        

        "clean_zone": extracted_data.dict(),
        
    
        "curated_zone": {
            "coherent": validation.coherent,
            "anomalie": validation.anomalie,
            "validation_timestamp": datetime.now().isoformat(),
            "status_final": "VALIDE" if validation.coherent else "A_VERIFIER"
        }
    }
    
    await documents_collection.insert_one(document_entry)
    return document_id