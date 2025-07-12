# utilities/huggingface.py

import requests

HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english"

HEADERS = {
    "Authorization": f"Bearer {"ss"}"
}

def parse_task_natural_text(text: str) -> dict:
    payload = {
        "inputs": text
    }
    response = requests.post(HUGGINGFACE_API_URL, headers=HEADERS, json=payload)
    response.raise_for_status()
    print(response)
    return response.json()
