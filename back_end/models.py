from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class UserCreate(BaseModel):
    prenom: str = Field(..., description="Prénom de l'utilisateur")
    nom: str = Field(..., description="Nom de famille")
    nom_entreprise: str = Field(..., description="Nom de l'entreprise ou raison sociale")
    service: Optional[str] = Field(default=None, description="Service (ex: Comptabilité, Conformité, Achat)")
    telephone: Optional[str] = Field(default=None, description="Numéro de téléphone pro")
    email: EmailStr
    password: str
    role: str = Field(default="user", description="Rôle: 'user' ou 'admin'")

class UserResponse(BaseModel):
    prenom: str
    nom: str
    nom_entreprise: str
    service: Optional[str]
    telephone: Optional[str]
    email: EmailStr
    role: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class ExtractedData(BaseModel):
    type: str  
    doc_id: str
    lot_id: str = None
    fournisseur_siret: str
    fournisseur_nom: str
    date_emission: str
    date_echeance: str
    chemin_fichier: str
    client_nom: Optional[str] = None
    client_siret: Optional[str] = None
    total_ht: Optional[float] = 0.0
    tva: Optional[float] = 0.0
    total_ttc: Optional[float] = 0.0
    iban: Optional[str] = None
    bic: Optional[str] = None
    organisme_nom: Optional[str] = None
    reference_attestation: Optional[str] = None

class ValidationResult(BaseModel):
    coherent: bool
    anomalie: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class StatusUpdate(BaseModel):
    status: str
