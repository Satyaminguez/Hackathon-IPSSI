import httpx
import base64
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration Airflow
AIRFLOW_URL = os.getenv("AIRFLOW_URL", "http://localhost:8081/api/v1")
AIRFLOW_USER = os.getenv("AIRFLOW_USER", "admin")
AIRFLOW_PASSWORD = os.getenv("AIRFLOW_PASSWORD", "admin")

async def trigger_dag(dag_id: str, conf: dict = None):
    """
    Déclenche un DAG Airflow via son API REST.
    """
    auth_str = f"{AIRFLOW_USER}:{AIRFLOW_PASSWORD}"
    encoded_auth = base64.b64encode(auth_str.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "conf": conf or {}
    }
    
    async with httpx.AsyncClient() as client:
        try:
            url = f"{AIRFLOW_URL}/dags/{dag_id}/dagRuns"
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code == 200 or response.status_code == 201:
                print(f"✅ DAG {dag_id} déclenché avec succès !")
                return True
            else:
                print(f"❌ Erreur lors du déclenchement du DAG {dag_id} : {response.text}")
                return False
        except Exception as e:
            print(f"⚠️ Exception lors de l'appel à l'API Airflow : {e}")
            return False
