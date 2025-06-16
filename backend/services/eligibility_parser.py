import os
import requests
import json5
import json
from dotenv import load_dotenv

load_dotenv()
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

def query_hf_zephyr(prompt: str) -> str:
    url = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "temperature": 0.3,
            "max_new_tokens": 768,
            "return_full_text": False
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"HF API error {response.status_code}: {response.text}")

    output = response.json()
    if isinstance(output, list) and "generated_text" in output[0]:
        return output[0]["generated_text"]
    elif isinstance(output, dict) and "generated_text" in output:
        return output["generated_text"]
    return ""

def extract_first_json_object(text: str) -> dict:
    """
    Attempts to extract and parse the first valid JSON object from a string.
    """
    # Remove markdown wrappers like ```json ... ```
    if "```json" in text:
        text = text.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in text:
        text = text.split("```", 1)[1].split("```", 1)[0].strip()

    # Remove duplicate keys if needed — Zephyr sometimes repeats key blocks
    # Optional: Basic fix for missing commas (best effort)
    text = text.replace("}\n{", "},\n{").replace("}\n\"", "},\n\"")

    # Try parsing full text as JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting the first JSON-like block manually
    start = None
    depth = 0
    for i, ch in enumerate(text):
        if ch == '{':
            if start is None:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start is not None:
                try:
                    return json.loads(text[start:i + 1])
                except json.JSONDecodeError:
                    continue
    return {}

def extract_eligibility_json_general(raw_text: str) -> dict:
    prompt = f"""
You are an intelligent assistant that extracts structured eligibility requirements from tender eligibility text.

Respond only with a valid JSON object (no markdown, no explanation).

Expected output format:
{{
  "experience": {{ "required": true, "minimum_years": 3 }},
  "gstin": {{ "required": true }},
  "pan": {{ "required": true }},
  "required_documents": ["EMD", "PAN card"],
  "certifications": ["ISO"],
  "financial_requirements": {{ "annual_turnover_required": true, "minimum_turnover_amount": null }},
  "blacklisting_or_litigation": {{ "mentioned": false }},
  "other_criteria": {{ "registration_on_gem": {{ "required": true }} }}
}}

If a field is not mentioned, mark `required: false`, use `null`, or an empty list as appropriate.

Eligibility Criteria Text:
{raw_text}

Respond only with the JSON.
"""
    zephyr_response = query_hf_zephyr(prompt)
    print("📄 Raw Zephyr output:\n", zephyr_response)
    parsed = extract_first_json_object(zephyr_response)
    print("✅ Final Parsed Output:\n", json.dumps(parsed, indent=2))
    return parsed
