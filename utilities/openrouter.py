import requests
from task_management.settings import OPENROUTER_API_KEY


def generate_task_description(title: str) -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Task Manager Summary"
    }
    prompt = f"Rewrite this task title as a clear, helpful task description: '{title}'"
    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    }
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload
    )
    response.raise_for_status()
    data = response.json()
    description = data["choices"][0]["message"]["content"].strip()
    return description
