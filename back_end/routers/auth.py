from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models import UserCreate, Token, UserResponse
from security import get_password_hash, verify_password, create_access_token, get_current_user
from database import users_collection

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register")
async def register(user: UserCreate):
    """Permet au Frontend de créer un compte (Fournisseur ou Admin)"""

    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    await users_collection.insert_one(user_dict)
    
    return {"message": f"Utilisateur {user.email} créé avec succès en tant que {user.role}"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Le Frontend envoie email/mot de passe et récupère un Token JWT"""
    # OAuth2 demande 'username' par défaut, on l'utilise pour stocker l'email du formulaire
    user = await users_collection.find_one({"email": form_data.username})
    
    # Vérification du mot de passe
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Génération du Token avec le rôle inclus !
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Permet au Frontend de récupérer le profil complet de l'utilisateur connecté"""
    # Le Depends(get_current_user) fait tout le travail : il lit le token, 
    # vérifie qu'il est valide, et retourne l'utilisateur depuis MongoDB.
    return current_user