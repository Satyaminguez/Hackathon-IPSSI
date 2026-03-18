from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models import UserCreate, Token, UserResponse
from security import get_password_hash, verify_password, create_access_token, get_current_user
from database import users_collection
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
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
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Permet au Frontend de récupérer le profil complet de l'utilisateur connecté"""
   
    current_user["_id"] = str(current_user["_id"])
    return current_user