import random
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

from faker import Faker
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class FactureGeneratorError(Exception):
    """Erreur liee a la generation d'une facture PDF."""


def to_decimal(value):
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def format_money(value):
    return f"{value:.2f} EUR"


def format_date(value):
    if isinstance(value, date):
        return value.strftime("%d/%m/%Y")

    if isinstance(value, str):
        return value

    raise FactureGeneratorError("La date doit etre un objet date ou une chaine.")


def get_catalogue_services():
    return [
        "Assistance technique sur projet applicatif",
        "Maintenance applicative corrective et evolutive",
        "Integration API entre applications metier",
        "Audit d'architecture SI",
        "Recette fonctionnelle et technique",
        "Pilotage de la TMA",
        "Migration et reprise de donnees",
        "Developpement de connecteurs d'echanges",
        "Support applicatif de niveau 2 et 3",
        "Accompagnement au deploiement en production",
        "Analyse et cadrage des besoins metier",
        "Assistance a maitrise d'ouvrage",
    ]


def generer_client(faker):
    return {
        "nom": faker.company(),
        "siret": "".join(str(random.randint(0, 9)) for _ in range(14)),
        "adresse": faker.street_address(),
        "ville": f"{faker.postcode()} {faker.city()}",
    }


def generer_coordonnees_bancaires():
    iban = "FR76 " + " ".join("".join(str(random.randint(0, 9)) for _ in range(4)) for _ in range(5))
    bic = "".join(random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(8))

    return {
        "iban": iban,
        "bic": bic,
    }


def generer_lignes_articles(faker):
    lignes = []

    for _ in range(random.randint(2, 5)):
        quantite = random.randint(1, 5)
        prix_unitaire_ht = to_decimal(Decimal(random.randint(8000, 150000)) / Decimal("100"))
        montant_ht = to_decimal(prix_unitaire_ht * quantite)

        lignes.append(
            {
                "designation": faker.random_element(elements=get_catalogue_services()),
                "quantite": quantite,
                "prix_unitaire_ht": prix_unitaire_ht,
                "montant_ht": montant_ht,
            }
        )

    return lignes


def calculer_totaux(lignes):
    total_ht = to_decimal(sum(ligne["montant_ht"] for ligne in lignes))
    tva = to_decimal(total_ht * Decimal("0.20"))
    total_ttc = to_decimal(total_ht + tva)

    return {
        "total_ht": total_ht,
        "tva": tva,
        "total_ttc": total_ttc,
    }


def construire_facture(entreprise):
    if not isinstance(entreprise, dict):
        raise FactureGeneratorError("Le parametre entreprise doit etre un dictionnaire.")

    champs_obligatoires = ["siret", "nom", "adresse", "ville"]
    champs_manquants = [champ for champ in champs_obligatoires if not entreprise.get(champ)]
    if champs_manquants:
        raise FactureGeneratorError(
            f"Le dictionnaire entreprise est incomplet. Champs manquants : {', '.join(champs_manquants)}."
        )

    faker = Faker("fr_FR")
    # Le fournisseur = entreprise vient de SIRENE, le client reste synthétique
    client = generer_client(faker)
    coordonnees_bancaires = generer_coordonnees_bancaires()
    lignes = generer_lignes_articles(faker)
    totaux = calculer_totaux(lignes)

    # L'échéance reste liée à la date d'émission
    date_emission = date.today() - timedelta(days=random.randint(0, 180))
    delai_echeance = random.choice([30, 45, 60]) # plus fun
    date_echeance = date_emission + timedelta(days=delai_echeance)
    numero = random.randint(1000, 9999)
    # Le doc_id garde l'année et le SIRET dans le même format que le reste du dataset
    doc_id = f"FAC-{date_emission.year}-{numero}_{entreprise['siret']}"

    return {
        "type": "facture",
        "doc_id": doc_id,
        "lot_id": None,
        "fournisseur_nom": entreprise["nom"],
        "fournisseur_siret": entreprise["siret"],
        "fournisseur_adresse": entreprise["adresse"],
        "fournisseur_ville": entreprise["ville"],
        "client_nom": client["nom"],
        "client_siret": client["siret"],
        "client_adresse": client["adresse"],
        "client_ville": client["ville"],
        "iban": coordonnees_bancaires["iban"],
        "bic": coordonnees_bancaires["bic"],
        "date_emission": date_emission,
        "date_echeance": date_echeance,
        "lignes": lignes,
        "total_ht": totaux["total_ht"],
        "tva": totaux["tva"],
        "total_ttc": totaux["total_ttc"],
        "coherent": True,
        "anomalie": None,
    }


def generer_pdf(facture, output_dir):
    # Partie pas fun qui génère le pdf (ses sections etc)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{facture['doc_id']}.pdf"

    styles = getSampleStyleSheet()
    titre_style = ParagraphStyle(
        name="TitreFacture",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=colors.HexColor("#1f2937"),
        spaceAfter=12,
    )
    section_style = ParagraphStyle(
        name="SectionFacture",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=colors.HexColor("#111827"),
        spaceAfter=6,
    )
    texte_style = ParagraphStyle(
        name="TexteFacture",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
    )

    story = [
        Paragraph("FACTURE", titre_style),
        Paragraph(f"Numero : {facture['doc_id']}", texte_style),
        Paragraph(f"Date d'emission : {format_date(facture['date_emission'])}", texte_style),
        Paragraph(f"Date d'echeance : {format_date(facture['date_echeance'])}", texte_style),
        Spacer(1, 8 * mm),
    ]

    fournisseur_bloc = Paragraph(
        "<b>Fournisseur</b><br/>"
        f"{facture['fournisseur_nom']}<br/>"
        f"SIRET : {facture['fournisseur_siret']}<br/>"
        f"{facture['fournisseur_adresse']}<br/>"
        f"{facture['fournisseur_ville']}",
        texte_style,
    )
    client_bloc = Paragraph(
        "<b>Client</b><br/>"
        f"{facture['client_nom']}<br/>"
        f"SIRET : {facture['client_siret']}<br/>"
        f"{facture['client_adresse']}<br/>"
        f"{facture['client_ville']}",
        texte_style,
    )

    # Fournisseur et client restent sur la même ligne
    infos_table = Table(
        [[fournisseur_bloc, client_bloc]],
        colWidths=[85 * mm, 85 * mm],
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
    story.extend([infos_table, Spacer(1, 10 * mm), Paragraph("Articles", section_style)])

    # Les lignes sont réinjectées dans un tableau simple pour le rendu final
    articles_data = [["Designation", "Quantite", "PU HT", "Montant HT"]]
    for ligne in facture["lignes"]:
        articles_data.append(
            [
                ligne["designation"],
                str(ligne["quantite"]),
                format_money(ligne["prix_unitaire_ht"]),
                format_money(ligne["montant_ht"]),
            ]
        )

    articles_table = Table(
        articles_data,
        colWidths=[90 * mm, 25 * mm, 35 * mm, 35 * mm],
        repeatRows=1,
    )
    articles_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e5e7eb")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#111827")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.extend([articles_table, Spacer(1, 8 * mm)])

    # Le bloc totaux reste aligné à droite
    totaux_table = Table(
        [
            ["Total HT", format_money(facture["total_ht"])],
            ["TVA 20%", format_money(facture["tva"])],
            ["Total TTC", format_money(facture["total_ttc"])],
        ],
        colWidths=[35 * mm, 35 * mm],
        hAlign="RIGHT",
    )
    totaux_table.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
                ("FONTNAME", (0, 0), (-1, -2), "Helvetica"),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("LINEABOVE", (0, -1), (-1, -1), 0.75, colors.HexColor("#111827")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(totaux_table)
    story.extend(
        [
            Spacer(1, 8 * mm),
            Paragraph("Reglement", section_style),
            Paragraph(f"IBAN : {facture['iban']}", texte_style),
            Paragraph(f"BIC : {facture['bic']}", texte_style),
        ]
    )

    try:
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
        raise FactureGeneratorError(
            f"Impossible de generer la facture PDF {output_file.name}."
        ) from error

    return output_file


def construire_metadata(facture, output_file):
    # On garde ici uniquement les champs utiles pour l'OCR et la validation
    return {
        "type": facture["type"],
        "doc_id": facture["doc_id"],
        "lot_id": facture["lot_id"],
        "fournisseur_siret": facture["fournisseur_siret"],
        "fournisseur_nom": facture["fournisseur_nom"],
        "client_nom": facture["client_nom"],
        "client_siret": facture["client_siret"],
        "iban": facture["iban"],
        "bic": facture["bic"],
        "date_emission": format_date(facture["date_emission"]),
        "date_echeance": format_date(facture["date_echeance"]),
        "total_ht": float(facture["total_ht"]),
        "tva": float(facture["tva"]),
        "total_ttc": float(facture["total_ttc"]),
        "chemin_fichier": str(output_file),
        "coherent": facture["coherent"],
        "anomalie": facture["anomalie"],
    }


def generer_facture(entreprise, output_dir):
    facture = construire_facture(entreprise)
    output_file = generer_pdf(facture, output_dir)
    return construire_metadata(facture, output_file)
