from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.providers.http.operators.http import SimpleHttpOperator
from datetime import datetime, timedelta
import asyncio

default_args = {
    'owner': 'data_engineer_team',
    'depends_on_past': False,
    'start_date': datetime(2026, 1, 1),
    'email': ['admin@filemina.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

# ---------------------------------------------------------
# DAG 1 : INGESTION & OCR PROCESSING
# Déclenché (Trigger) par l'API FastAPI lors de l'upload d'un client
# ---------------------------------------------------------
dag_ingestion = DAG(
    '1_ocr_document_ingestion',
    default_args=default_args,
    description="Pipeline d'ingestion des factures, extraction OCR Tesseract et nettoyage IA",
    schedule_interval=None, # Déclenché manuellement via l'API (TriggerDagRunOperator)
    catchup=False,
    tags=['ingestion', 'ocr', 'raw_to_clean']
)

def run_ocr_extraction(**context):
    """
    Simulation de la tâche Airflow qui récupère le PDF brut (Raw Zone)
    et lance le processus d'Intelligence Artificielle OCR.
    """
    dag_run_conf = context.get('dag_run').conf
    document_id = dag_run_conf.get('document_id')
    file_path = dag_run_conf.get('file_path')
    
    print(f"Lancement de l'extracteur OCR sur le fichier {file_path}")
    print("Moteur: Tesseract 5.0 | Algorithme IA de classification ...")
    
    # Dans la vraie vie, ici on chargerait un modèle PyTorch/TensorFlow ou Tesseract
    # et on insérerait le JSON généré dans MongoDB.
    
    return {"status": "success", "zone": "CLEAN", "document_id": document_id}


def check_anomalies(**context):
    """
    Tâche qui vérifie la cohérence comptable (SIRET, Montants HT/TTC).
    """
    result = context['task_instance'].xcom_pull(task_ids='task_ocr_extraction')
    print(f"Vérification d'anomalies sur le document {result['document_id']} ...")
    # Logique métier (Vérification des doublons dans MongoDB, règles URSSAF...)
    return "Cohérent"


# 1. Tâche d'extraction (Lourde en ressource (GPU/CPU))
t1_ocr = PythonOperator(
    task_id='task_ocr_extraction',
    python_callable=run_ocr_extraction,
    provide_context=True,
    dag=dag_ingestion,
)

# 2. Tâche de conformité (Règles métiers)
t2_conformite = PythonOperator(
    task_id='task_rule_engine',
    python_callable=check_anomalies,
    provide_context=True,
    dag=dag_ingestion,
)

# 3. Tâche d'alerte (Envoi d'un mail au client via une API interne)
# Confirmation que l'upload est en cours d'analyse
t3_notify_client = SimpleHttpOperator(
    task_id='task_notify_upload_success',
    http_conn_id='notification_api', # Connexion configurée dans Airflow UI
    endpoint='/api/internal/notify',
    method='POST',
    data="""{"user_email": "{{ dag_run.conf['email'] }}", "message": "Votre document est en cours de traitement IA."}""",
    headers={"Content-Type": "application/json"},
    dag=dag_ingestion,
)

# Pipeline Flow : Ingestion -> Validation -> Notification
t1_ocr >> t2_conformite >> t3_notify_client
