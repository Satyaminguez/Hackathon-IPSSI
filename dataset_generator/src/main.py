import json
from pathlib import Path
import sys


CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    # Permet d'importer les modules du dossier src
    sys.path.insert(0, str(CURRENT_DIR))

from api.sirene_client import get_entreprise
from generators.anomalies import corrompre_document
from generators.attestation_urssaf import (
    construire_attestation_urssaf,
    construire_metadata_attestation_urssaf,
    generer_pdf_attestation_urssaf,
)
from generators.devis import construire_devis, construire_metadata_devis, generer_pdf_devis
from generators.facture import construire_facture, construire_metadata, generer_pdf
from generators.images import generer_variantes_image
from splits import generer_splits_depuis_metadata


SIRETS = [
    "33070384400036",
    "32682006500083",
    "70204275500554",
    "73207531200122",
    "53471417500013",
    "40296865500165",
    "37755024900041",
    "34176529500124",
    "35386190900458",
    "98923692200013",
]
ANOMALIES_FACTURE_PLAN = [
    "iban_invalide",
    "siret_malforme",
    "bic_invalide",
    "tva_incoherente",
    "ttc_incorrect",
    "echeance_depassee",
    "format_date_invalide",
    "siret_malforme",
    "iban_invalide",
    "bic_invalide",
]
ANOMALIES_INTERDOCUMENT_PLAN = [
    "siret_mismatch",
    "nom_mismatch",
    "siret_mismatch",
    "nom_mismatch",
    "siret_mismatch",
    "nom_mismatch",
    "siret_mismatch",
    "nom_mismatch",
    "siret_mismatch",
    "nom_mismatch",
]
ANOMALIES_DEVIS_PLAN = [
    "tva_incoherente",
    "siret_malforme",
    "ttc_incorrect",
    "format_date_invalide",
    "echeance_depassee",
    "siret_malforme",
    "tva_incoherente",
    "ttc_incorrect",
    "format_date_invalide",
    "echeance_depassee",
]
OUTPUT_DIR = Path("data/raw/documents/factures/pdf")
FACTURE_IMAGE_DIR = Path("data/raw/documents/factures/images")
ATTESTATION_OUTPUT_DIR = Path("data/raw/documents/attestations_urssaf/pdf")
ATTESTATION_IMAGE_DIR = Path("data/raw/documents/attestations_urssaf/images")
DEVIS_OUTPUT_DIR = Path("data/raw/documents/devis/pdf")
DEVIS_IMAGE_DIR = Path("data/raw/documents/devis/images")
METADATA_PATH = Path("data/metadata/metadata.json")
SPLITS_PATH = Path("data/metadata/splits.json")
NB_LOTS_IMAGES = 6


def append_metadata(metadata, metadata_path):
    # On ajoute les métadonnées du document généré dans un le fichier global
    metadata_path.parent.mkdir(parents=True, exist_ok=True)

    if metadata_path.exists():
        try:
            contenu = json.loads(metadata_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            raise ValueError(
                f"Le fichier metadata {metadata_path} n'est pas un JSON valide."
            ) from error
    else:
        contenu = []

    if not isinstance(contenu, list):
        raise ValueError(
            f"Le fichier metadata {metadata_path} doit contenir une liste JSON."
        )

    contenu.append(metadata)
    metadata_path.write_text(
        json.dumps(contenu, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

def produire_document_et_metadata(document, output_dir, pdf_builder, metadata_builder):
    # Appelle pour générer le PDF & metadonnées d'un document à partir de sa version structurée
    output_file = pdf_builder(document, output_dir)
    return metadata_builder(document, output_file)


def ajouter_lot_id(document, lot_id):
    # Ajoute un num de lot 
    document["lot_id"] = lot_id
    return document


def choisir_documents_pour_images(index, documents_lot):
    # Choisit le sous-ensmeble de doc pour générer leurs images (selon le lot)
    if index >= NB_LOTS_IMAGES:
        return []

    def premier(nom_liste):
        if not documents_lot[nom_liste]:
            raise ValueError(f"Aucun document disponible dans {nom_liste}.")
        return documents_lot[nom_liste][0]

    def unique(nom_cle):
        if documents_lot[nom_cle] is None:
            raise ValueError(f"Aucun document disponible dans {nom_cle}.")
        return documents_lot[nom_cle]

    # Les 6 premiers lots suffisent pour retrouver le même ratio que les PDF avec & sans anomalies
    if index in [0, 1]:
        return [
            premier("factures_propres"),
            premier("devis_propres"),
            premier("attestations_propres"),
        ]

    if index == 2:
        return [
            unique("facture_intra"),
            premier("devis_propres"),
            premier("attestations_propres"),
        ]

    if index == 3:
        return [
            premier("factures_propres"),
            unique("devis_intra"),
            premier("attestations_propres"),
        ]

    if index == 4:
        return [
            premier("factures_propres"),
            premier("devis_propres"),
            unique("attestation_inter"),
        ]

    # Le dernier lot retenu concentre les trois cas restants
    return [
        unique("facture_intra"),
        unique("devis_intra"),
        unique("attestation_inter"),
    ]


def choisir_dossier_images(type_document):
    # On choisit le dossier d'images en fonction du type de document
    if type_document == "facture":
        return FACTURE_IMAGE_DIR

    if type_document == "devis":
        return DEVIS_IMAGE_DIR

    if type_document == "attestation":
        return ATTESTATION_IMAGE_DIR

    raise ValueError(f"Type de document image non gere : {type_document}")


def generer_sous_ensemble_images(documents_source):
    # Les images partent dans le même metadata.json que les PDF
    for metadata_pdf in documents_source:
        try:
            image_dir = choisir_dossier_images(metadata_pdf["type"])
            metadata_images = generer_variantes_image(metadata_pdf, image_dir)

            for metadata_image in metadata_images:
                append_metadata(metadata_image, METADATA_PATH)

            print(f"[OK] Images generees   : {metadata_pdf['doc_id']} -> {len(metadata_images)} variantes")
        except Exception as error:
            print(f"Erreur generation images {metadata_pdf['doc_id']} : {error}")


def main():
    # Check la taille des listes car ici on doit avoir la même 
    if len(SIRETS) != len(ANOMALIES_FACTURE_PLAN):
        raise ValueError("La liste SIRETS et la liste ANOMALIES_FACTURE_PLAN doivent avoir la meme taille.")

    if len(SIRETS) != len(ANOMALIES_INTERDOCUMENT_PLAN):
        raise ValueError(
            "La liste SIRETS et la liste ANOMALIES_INTERDOCUMENT_PLAN doivent avoir la meme taille."
        )

    if len(SIRETS) != len(ANOMALIES_DEVIS_PLAN):
        raise ValueError("La liste SIRETS et la liste ANOMALIES_DEVIS_PLAN doivent avoir la meme taille.")

    # On remplit cette liste au fil des lots puis on génère les images à la fin
    documents_source_images = []

    for index, siret in enumerate(SIRETS):
        lot_id = f"LOT-{index + 1:04d}"
        # On garde le lot courant en mémoire pour choisir ensuite le sous-ensemble image
        documents_lot = {
            "factures_propres": [],
            "facture_intra": None,
            "attestations_propres": [],
            "attestation_inter": None,
            "devis_propres": [],
            "devis_intra": None,
        }

        try:
            entreprise = get_entreprise(siret)
        except Exception as error:
            print(f"Erreur chargement entreprise {siret} : {error}")
            continue

        # Chaque lot contient 2 factures propres (sans anomalie) puis 1 facture intra (anomalie à elle seule)
        for _ in range(2):
            try:
                facture = construire_facture(entreprise)
                facture = ajouter_lot_id(facture, lot_id)
                metadata = produire_document_et_metadata(
                    facture,
                    OUTPUT_DIR,
                    generer_pdf,
                    construire_metadata,
                )
                append_metadata(metadata, METADATA_PATH)
                documents_lot["factures_propres"].append(metadata)
                print(f"[OK] Facture propre     : {metadata['doc_id']}")
            except Exception as error:
                print(f"Erreur facture propre {siret} : {error}")

        anomalie_facture = ANOMALIES_FACTURE_PLAN[index]

        try:
            facture = construire_facture(entreprise)
            facture = ajouter_lot_id(facture, lot_id)
            facture = corrompre_document(facture, anomalie_facture)
            metadata = produire_document_et_metadata(
                facture,
                OUTPUT_DIR,
                generer_pdf,
                construire_metadata,
            )
            append_metadata(metadata, METADATA_PATH)
            documents_lot["facture_intra"] = metadata
            print(f"[OK] Facture intra     : {metadata['doc_id']} - anomalie : {anomalie_facture}")
        except Exception as error:
            print(f"Erreur facture intra {siret} : {error}")

        # Même logique côté attestations avec le cas inter (anomalie qui se vérifie entre documents) 
        for _ in range(2):
            try:
                attestation = construire_attestation_urssaf(entreprise)
                attestation = ajouter_lot_id(attestation, lot_id)
                metadata = produire_document_et_metadata(
                    attestation,
                    ATTESTATION_OUTPUT_DIR,
                    generer_pdf_attestation_urssaf,
                    construire_metadata_attestation_urssaf,
                )
                append_metadata(metadata, METADATA_PATH)
                documents_lot["attestations_propres"].append(metadata)
                print(f"[OK] Attestation URSSAF propre : {metadata['doc_id']}")
            except Exception as error:
                print(f"Erreur attestation URSSAF {siret} : {error}")

        anomalie_attestation = ANOMALIES_INTERDOCUMENT_PLAN[index]
        
        try:
            # On applique à l'attestation l'anomalie inter-document pour faire le lien avec les 
            # autres documents (même lot_id mais infos incohérentes)
            attestation = construire_attestation_urssaf(entreprise)
            attestation = ajouter_lot_id(attestation, lot_id)
            attestation = corrompre_document(attestation, anomalie_attestation)
            metadata = produire_document_et_metadata(
                attestation,
                ATTESTATION_OUTPUT_DIR,
                generer_pdf_attestation_urssaf,
                construire_metadata_attestation_urssaf,
            )
            append_metadata(metadata, METADATA_PATH)
            documents_lot["attestation_inter"] = metadata
            print(
                f"[OK] Attestation URSSAF inter   : {metadata['doc_id']} - anomalie : {anomalie_attestation}"
            )
        except Exception as error:
            print(f"Erreur attestation URSSAF inter {siret} : {error}")

        # Puis 2 devis propres et 1 devis intra 
        for _ in range(2):
            try:
                devis = construire_devis(entreprise)
                devis = ajouter_lot_id(devis, lot_id)
                metadata = produire_document_et_metadata(
                    devis,
                    DEVIS_OUTPUT_DIR,
                    generer_pdf_devis,
                    construire_metadata_devis,
                )
                append_metadata(metadata, METADATA_PATH)
                documents_lot["devis_propres"].append(metadata)
                print(f"[OK] Devis propre       : {metadata['doc_id']}")
            except Exception as error:
                print(f"Erreur devis propre {siret} : {error}")

        anomalie_devis = ANOMALIES_DEVIS_PLAN[index]

        try:
            devis = construire_devis(entreprise)
            devis = ajouter_lot_id(devis, lot_id)
            devis = corrompre_document(devis, anomalie_devis)
            metadata = produire_document_et_metadata(
                devis,
                DEVIS_OUTPUT_DIR,
                generer_pdf_devis,
                construire_metadata_devis,
            )
            append_metadata(metadata, METADATA_PATH)
            documents_lot["devis_intra"] = metadata
            print(f"[OK] Devis intra       : {metadata['doc_id']} - anomalie : {anomalie_devis}")
        except Exception as error:
            print(f"Erreur devis intra {siret} : {error}")

        try:
            # Le sous-ensemble image est choisi lot par lot pour garder le bon ratio doc avec anomalies / doc propres
            documents_source_images.extend(choisir_documents_pour_images(index, documents_lot))
        except Exception as error:
            print(f"Erreur selection images {lot_id} : {error}")

    generer_sous_ensemble_images(documents_source_images)
    generer_splits_depuis_metadata(METADATA_PATH, SPLITS_PATH)


if __name__ == "__main__":
    main()
