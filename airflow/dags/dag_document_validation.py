from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.providers.http.operators.http import SimpleHttpOperator
from datetime import datetime
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
    schedule_interval=None,
    catchup=False,
    tags=['export_json', 'crm', 'notifications']
)

def build_erp_payload(**context):
    """
    On prépare les données structurées (le JSON certifié du DataLake)
    pour les envoyer au serveur comptable de l'entreprise (ex: Sage, SAP).
    """
    conf = context.get('dag_run').conf
    status = conf.get('status')
    doc_id = conf.get('document_id')
    user_email = conf.get('user_email')
    
    print(f"Statut manuel de l'admin = {status} pour le doc: {doc_id}")
    return {"status": status, "doc_id": doc_id, "email": user_email}

# 1. Tâche de préparation des données export
t1_prepare_payload = PythonOperator(
    task_id='prepare_certified_json',
    python_callable=build_erp_payload,
    provide_context=True,
    dag=dag_erp,
)

# 2. Tâche ERP Externe : Envoi des factures validées au logiciel de comptabilité
t2_export_erp = SimpleHttpOperator(
    task_id='export_to_sap_erp',
    http_conn_id='sap_api_conn',
    endpoint='/v1/invoices',
    method='POST',
    data="""{"document_id": "{{ dag_run.conf['doc_id'] }}", "status": "VERIFIE", "data": "json_extracted_zone"}""",
    headers={"Authorization": "Bearer SECRETERP"},
    # On n'exporte à l'ERP *que* si le document a été certifié par l'administrateur
    do_xcom_push=True,
    dag=dag_erp,
)

# 3. Tâche de Mail (Resend API)
# Si c'est Rejeté ou Validé, un e-mail part au client.
t3_send_resend_mail = SimpleHttpOperator(
    task_id='trigger_resend_mail_node',
    http_conn_id='resend_api',
    endpoint='/emails',
    method='POST',
    data=json.dumps({
        "from": "Filemina Admin <admin@filemina.com>",
        "to": ["{{ dag_run.conf['user_email'] }}"],
        "subject": "La décision concernant votre document - Filemina",
        "html": "<p>Bonjour, l'administrateur a pris une décision concernant votre document: <strong>{{ dag_run.conf['status'] }}</strong></p>"
    }),
    headers={"Authorization": "Bearer RESEND_API_KEY", "Content-Type": "application/json"},
    dag=dag_erp,
)

# Pipeline Flow
# Préparation des données -> Exporte vers le CRM -> Envoie un e-mail de clôture au client.
t1_prepare_payload >> [t2_export_erp, t3_send_resend_mail]
