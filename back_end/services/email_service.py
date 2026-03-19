import resend
from jinja2 import Environment, FileSystemLoader
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration Resend
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Dossier des templates
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates")
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

async def send_reset_password_email(to_email: str, token: str):
    """
    Envoie un email de réinitialisation via l'API Resend.
    """
    if not RESEND_API_KEY:
        print("\n[ATTENTION] RESEND_API_KEY non configurée.")
        print(f"[TOKEN] {FRONTEND_URL}/reset-password?token={token}\n")
        return False

    try:
        # 1. Rendu du template HTML
        template = env.get_template("reset_password.html")
        html_content = template.render(
            email=to_email, 
            token=token, 
            frontend_url=FRONTEND_URL
        )

        # 2. Envoi via Resend SDK
        params = {
            "from": f"DocSafe AI <{EMAIL_SENDER}>",
            "to": [to_email],
            "subject": "Réinitialisez votre mot de passe - DocSafe AI",
            "html": html_content,
        }

        email = resend.Emails.send(params)
        
        print(f"[SUCCESS] Email envoyé via Resend (ID: {email['id']}) à {to_email}")
        return True

    except Exception as e:
        print(f"[ERROR] Échec de l'envoi via Resend : {e}")
        return False

async def send_document_validated_email(to_email: str, filename: str):
    """Envoie un email confirmant la validation d'un document"""
    if not RESEND_API_KEY:
        print(f"\n[ATTENTION] Validation mockée: Email à {to_email} pour {filename}")
        return False

    try:
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto; border-top: 4px solid #10b981;">
                    <h2 style="color: #1e293b;">Votre document a été certifié ✅</h2>
                    <p style="color: #475569; line-height: 1.6;">Bonjour,</p>
                    <p style="color: #475569; line-height: 1.6;">Nous vous informons que votre document <strong>{filename}</strong> a été inspecté et <strong>validé</strong> par nos équipes avec succès. Il est désormais enregistré de manière sécurisée dans votre profil.</p>
                    <p style="color: #475569; line-height: 1.6;">Merci de votre confiance.</p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">L'équipe Supervision DocSafe AI</p>
                </div>
            </body>
        </html>
        """
        params = {
            "from": f"Supervision DocSafe AI <{EMAIL_SENDER}>",
            "to": [to_email],
            "subject": f"Document validé : {filename}",
            "html": html_content,
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"[ERROR] Email de validation échoué : {e}")
        return False

async def send_document_rejected_email(to_email: str, filename: str, reason: str):
    """Envoie un email notifiant du rejet d'un document, avec la cause"""
    if not RESEND_API_KEY:
        print(f"\n[ATTENTION] Rejet mocké: Email à {to_email} pour {filename}. Raison: {reason}")
        return False

    try:
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto; border-top: 4px solid #f43f5e;">
                    <h2 style="color: #1e293b;">Action requise sur votre document ❌</h2>
                    <p style="color: #475569; line-height: 1.6;">Bonjour,</p>
                    <p style="color: #475569; line-height: 1.6;">L'audit de votre document <strong>{filename}</strong> a été finalisé, mais il n'a pas pu être validé en l'état.</p>
                    <div style="background-color: #fff1f2; padding: 15px; border-left: 4px solid #f43f5e; margin: 20px 0;">
                        <span style="color: #9f1239; font-weight: bold;">Motif du refus :</span>
                        <p style="color: #be123c; margin-top: 5px;">{reason}</p>
                    </div>
                    <p style="color: #475569; line-height: 1.6;">Veuillez vous connecter à la plateforme pour régulariser votre dossier.</p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">L'équipe Conformité DocSafe AI</p>
                </div>
            </body>
        </html>
        """
        params = {
            "from": f"Conformité DocSafe AI <{EMAIL_SENDER}>",
            "to": [to_email],
            "subject": f"Document non conforme : {filename}",
            "html": html_content,
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"[ERROR] Email de rejet échoué : {e}")
        return False
