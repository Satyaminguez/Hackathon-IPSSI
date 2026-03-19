import random
from datetime import date, timedelta
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class AttestationUrssafGeneratorError(Exception):
    """Erreur liee a la generation d'une attestation URSSAF PDF."""


def format_date(value):
    if isinstance(value, date):
        return value.strftime("%d/%m/%Y")

    if isinstance(value, str):
        return value

    raise AttestationUrssafGeneratorError("La date doit etre un objet date ou une chaine.")


def construire_attestation_urssaf(entreprise):
    if not isinstance(entreprise, dict):
        raise AttestationUrssafGeneratorError("Le parametre entreprise doit etre un dictionnaire.")

    champs_obligatoires = ["siret", "nom", "adresse", "ville"]
    champs_manquants = [champ for champ in champs_obligatoires if not entreprise.get(champ)]
    if champs_manquants:
        raise AttestationUrssafGeneratorError(
            f"Le dictionnaire entreprise est incomplet. Champs manquants : {', '.join(champs_manquants)}."
        )

    # La validité varie selon le document pour éviter des dates trop répétitives
    date_emission = date.today() - timedelta(days=random.randint(0, 120))
    duree_validite = random.choice([30, 60, 90, 180])
    date_echeance = date_emission + timedelta(days=duree_validite)
    numero = random.randint(1000, 9999)
    # La référence suit le même millésime que le document
    doc_id = f"URS-{date_emission.year}-{numero}_{entreprise['siret']}"

    return {
        "type": "attestation",
        "doc_id": doc_id,
        "lot_id": None,
        "fournisseur_nom": entreprise["nom"],
        "fournisseur_siret": entreprise["siret"],
        "fournisseur_adresse": entreprise["adresse"],
        "fournisseur_ville": entreprise["ville"],
        "organisme_nom": "URSSAF",
        "reference_attestation": f"ATT-{date_emission.year}-{numero}",
        "date_emission": date_emission,
        "date_echeance": date_echeance,
        "mention": "Entreprise a jour de ses obligations declaratives et de paiement.",
        "coherent": True,
        "anomalie": None,
    }


def generer_pdf_attestation_urssaf(attestation, output_dir):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{attestation['doc_id']}.pdf"

    styles = getSampleStyleSheet()
    titre_style = ParagraphStyle(
        name="TitreAttestationUrssaf",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=colors.HexColor("#1f2937"),
        spaceAfter=12,
    )
    section_style = ParagraphStyle(
        name="SectionAttestationUrssaf",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=colors.HexColor("#111827"),
        spaceAfter=6,
    )
    texte_style = ParagraphStyle(
        name="TexteAttestationUrssaf",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
    )

    # L'en-tête reprend surtout la référence et la période de validité
    story = [
        Paragraph("ATTESTATION DE VIGILANCE URSSAF", titre_style),
        Paragraph(f"Reference : {attestation['reference_attestation']}", texte_style),
        Paragraph(f"Date d'emission : {format_date(attestation['date_emission'])}", texte_style),
        Paragraph(f"Date d'echeance : {format_date(attestation['date_echeance'])}", texte_style),
        Spacer(1, 8 * mm),
    ]

    organisme_bloc = Paragraph(
        "<b>Organisme emetteur</b><br/>"
        f"{attestation['organisme_nom']}",
        texte_style,
    )
    entreprise_bloc = Paragraph(
        "<b>Entreprise concernee</b><br/>"
        f"{attestation['fournisseur_nom']}<br/>"
        f"SIRET : {attestation['fournisseur_siret']}<br/>"
        f"{attestation['fournisseur_adresse']}<br/>"
        f"{attestation['fournisseur_ville']}",
        texte_style,
    )

    # Organisme et entreprise concernée restent dans le même bloc d'infos
    infos_table = Table(
        [[organisme_bloc, entreprise_bloc]],
        colWidths=[60 * mm, 110 * mm],
        hAlign="LEFT",
    )
    infos_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.extend([infos_table, Spacer(1, 10 * mm), Paragraph("Declaration", section_style)])

    # La déclaration reprend la mention et la date de validité
    declaration_table = Table(
        [
            ["Mention", attestation["mention"]],
            ["Validite", f"Jusqu'au {format_date(attestation['date_echeance'])}"],
        ],
        colWidths=[35 * mm, 135 * mm],
        hAlign="LEFT",
    )
    declaration_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e5e7eb")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.extend([declaration_table, Spacer(1, 8 * mm)])

    try:
        # L'attestation reste volontairement compacte sur une seule page
        document = SimpleDocTemplate(
            str(output_file),
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )
        document.build(story)
    except Exception as error:
        raise AttestationUrssafGeneratorError(
            f"Impossible de generer l'attestation URSSAF PDF {output_file.name}."
        ) from error

    return output_file


def construire_metadata_attestation_urssaf(attestation, output_file):
    # On garde ici les champs nécessaires pour recouper l'attestation avec le lot
    return {
        "type": attestation["type"],
        "doc_id": attestation["doc_id"],
        "lot_id": attestation["lot_id"],
        "fournisseur_siret": attestation["fournisseur_siret"],
        "fournisseur_nom": attestation["fournisseur_nom"],
        "organisme_nom": attestation["organisme_nom"],
        "reference_attestation": attestation["reference_attestation"],
        "date_emission": format_date(attestation["date_emission"]),
        "date_echeance": format_date(attestation["date_echeance"]),
        "chemin_fichier": str(output_file),
        "coherent": attestation["coherent"],
        "anomalie": attestation["anomalie"],
    }


def generer_attestation_urssaf(entreprise, output_dir):
    attestation = construire_attestation_urssaf(entreprise)
    output_file = generer_pdf_attestation_urssaf(attestation, output_dir)
    return construire_metadata_attestation_urssaf(attestation, output_file)
