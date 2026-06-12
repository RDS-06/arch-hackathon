import requests

url = "http://127.0.0.1:8000/ask"

data = {
    "question": "What are symptoms of asthma?"
}

response = requests.post(url, json=data)

print(response.json())