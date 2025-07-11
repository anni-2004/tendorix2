from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

def compute_similarity(text1, text2):
    emb1 = model.encode(text1, convert_to_tensor=True)
    emb2 = model.encode(text2, convert_to_tensor=True)
    return float(util.pytorch_cos_sim(emb1, emb2)[0][0])

def compute_tender_match_score(structured_eligibility, company):
    score = 0
    total = 0
    field_scores = {}
    missing_fields = []

    # Boolean & scalar fields
    boolean_fields = [
        ("pan", "pan"),
        ("gstin", "gstin"),
        ("registration_on_gem", "registration_on_gem"),
    ]
    for tender_field, company_field in boolean_fields:
        tender_req = structured_eligibility.get(tender_field, {}).get("required", False)
        company_has = company.get(company_field, False)
        total += 1
        if not tender_req or (tender_req and company_has):
            score += 1
            field_scores[tender_field] = 1
        else:
            field_scores[tender_field] = 0
            missing_fields.append(tender_field)

    # Experience
    tender_exp = structured_eligibility.get("experience", {})
    required_exp = tender_exp.get("required", False)
    min_years = tender_exp.get("minimum_years", 0) or 0
    company_exp = company.get("experience_years", 0)
    total += 1
    if not required_exp or (required_exp and company_exp >= min_years):
        score += 1
        field_scores["experience"] = 1
    else:
        field_scores["experience"] = 0
        missing_fields.append("experience")

    # Annual Turnover
    fin_req = structured_eligibility.get("financial_requirements", {})
    turnover_req = fin_req.get("annual_turnover_required", False)
    min_turnover = fin_req.get("minimum_turnover_amount", 0) or 0
    company_turnover = company.get("annual_turnover", 0)
    total += 1
    if not turnover_req or (turnover_req and company_turnover >= min_turnover):
        score += 1
        field_scores["financial_requirements"] = 1
    else:
        field_scores["financial_requirements"] = 0
        missing_fields.append("financial_requirements")

    # Blacklisting
    blacklisting = structured_eligibility.get("blacklisting_or_litigation", {}).get("mentioned", False)
    total += 1
    if not blacklisting:
        score += 1
        field_scores["blacklisting_or_litigation"] = 1
    else:
        field_scores["blacklisting_or_litigation"] = 0
        missing_fields.append("blacklisting_or_litigation")

    # Required Documents
    tender_docs = structured_eligibility.get("required_documents", [])
    company_docs = company.get("documents_available", [])
    total += 1
    if not tender_docs:
        score += 1
        field_scores["required_documents"] = 1
    else:
        matched_docs = sum(
            1 for tdoc in tender_docs
            for cdoc in company_docs
            if compute_similarity(tdoc.lower(), cdoc.lower()) > 0.75
        )
        if matched_docs / len(tender_docs) >= 0.7:
            score += 1
            field_scores["required_documents"] = 1
        else:
            field_scores["required_documents"] = 0
            missing_fields.append("required_documents")

    # Certifications
    tender_certs = structured_eligibility.get("certifications", [])
    company_certs = company.get("certifications", [])
    total += 1
    if not tender_certs:
        score += 1
        field_scores["certifications"] = 1
    else:
        matched_certs = sum(
            1 for tcert in tender_certs
            for ccert in company_certs
            if compute_similarity(tcert.lower(), ccert.lower()) > 0.75
        )
        if matched_certs / len(tender_certs) >= 0.7:
            score += 1
            field_scores["certifications"] = 1
        else:
            field_scores["certifications"] = 0
            missing_fields.append("certifications")

    # Other criteria (optional)
    other_criteria = structured_eligibility.get("other_criteria", {})
    company_desc = company.get("description", "")
    total += 1
    if not other_criteria:
        score += 1
        field_scores["other_criteria"] = 1
    else:
        criteria_text = " ".join(f"{k}: {v}" for k, v in other_criteria.items())
        sim = compute_similarity(criteria_text.lower(), company_desc.lower())
        if sim > 0.7:
            score += 1
            field_scores["other_criteria"] = 1
        else:
            field_scores["other_criteria"] = 0
            missing_fields.append("other_criteria")

    final_score = round((score / total) * 100, 2) if total > 0 else 0
    eligible = final_score >= 70  # Threshold

    return {
        "matching_score": final_score,
        "eligible": eligible,
        "field_scores": field_scores,
        "missing_fields": missing_fields
    }
