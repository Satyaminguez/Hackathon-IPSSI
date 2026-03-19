from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.providers.http.operators.http import SimpleHttpOperator
from datetime import datetime, timedelta
import json

default_args = {
    'owner': 'admin_team',
    'start_date': datetime(2026, 1, 1),
    'retries': 1,
}

# ---------------------------------------------------------
# DAG 2 : ARCHITECTURE ERP & ENVOI D'EMAILS APRÈS VALIDATION
# Déclenché (Trigger) par l'API React lorsque l'admin clique sur "Certifier" ou "Rejeter"
# ---------------------------------------------------------
dag_erp = DAG(
    '2_document_validation_and_export',
    default_args=default_args,
    description="Pipeline d'export vers l'ERP (Curated Zone) et notifications par email via Resend",
    schedule_interval=None, # Déclenché via API lors de la Validation Admin
    catchup=False,
    tags=['export_json', 'crm', 'notifications']
)

def build_erp_payload(**context):
    """
    On prépare les données structurées (le JSON certifié du DataLake)
    pour les envoyer au serveur comptable de l'entreprise (ex: Sage, SAP).
    """
    conf = context.get('dag_run').conf or {}
    status = conf.get('status', 'VERIFIE')
    doc_id = conf.get('document_id', 'DOC-AUTO-123')
    user_email = conf.get('user_email', 'kazadiabondance50@gmail.com')
    
    print(f"Statut manuel de l'admin = {status} pour le doc: {doc_id}")
    return {"status": status, "doc_id": doc_id, "email": user_email}

# 1. Tâche de préparation des données export
t1_prepare_payload = PythonOperator(
    task_id='prepare_certified_json',
    python_callable=build_erp_payload,
    provide_context=True,
    dag=dag_erp,
)

import time

def mock_export_erp(**context):
    conf = context.get('dag_run').conf or {}
    doc_id = conf.get('document_id', 'DOC-AUTO-123')
    status = conf.get('status', 'VERIFIE')
    print(f"[ERP SAP SIMULATION] Connexion au serveur SAP...")
    time.sleep(2)
    print(f"Export réussi de la facture {doc_id} avec le statut {status}.")
    return "ERP OK"

def mock_send_email(**context):
    conf = context.get('dag_run').conf or {}
    email = conf.get('user_email', 'kazadiabondance50@gmail.com')
    print(f"[RESEND SIMULATION] Préparation de l'email pour {email}...")
    time.sleep(1)
    print("Email de décision administrateur envoyé !")
    return "Email OK"

# 2. Tâche ERP Externe (Mock pour Hackathon)
t2_export_erp = PythonOperator(
    task_id='export_to_sap_erp',
    python_callable=mock_export_erp,
    provide_context=True,
    dag=dag_erp,
)

# 3. Tâche de Mail (Mock pour Hackathon)
t3_send_resend_mail = PythonOperator(
    task_id='trigger_resend_mail_node',
    python_callable=mock_send_email,
    provide_context=True,
    dag=dag_erp,
)

# Pipeline Flow
# Préparation des données -> Exporte vers le CRM -> Envoie un e-mail de clôture au client.
t1_prepare_payload >> [t2_export_erp, t3_send_resend_mail]
