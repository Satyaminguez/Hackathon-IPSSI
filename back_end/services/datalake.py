from datetime import datetime
import uuid
from models import ExtractedData, ValidationResult

# On importe la connexion qui pointe vers ton cluster en ligne depuis database.py !
from database import documents_collection

async def save_to_datalake(filename: str, raw_content: bytes, extracted_data: ExtractedData, validation: ValidationResult, user_email: str):
    """
    Sauvegarde le document dans MongoDB (Cluster en ligne) en suivant l'architecture Data Lake (3 zones).
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
    
    # L'insertion se fait maintenant sur Atlas dans la DB "filemina", collection "documents"
    await documents_collection.insert_one(document_entry)
    return document_id