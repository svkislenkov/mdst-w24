import requests

# Define the URL of the FastAPI endpoint
url = "http://localhost:8000/"

# Define the payload with the image path
payload = {
    "image_path": "Backend/banana.jpeg"  # Update with the path to your test image
}

# Send a POST request
response = requests.post(url, json=payload)

# Check the status code and response text
print(f'Status Code: {response.status_code}')
print(f'Response Text: {response.text}')

# Attempt to parse JSON if the response is successful
if response.status_code == 200:
    try:
        json_response = response.json()
        print(f'JSON Response: {json_response}')
    except requests.exceptions.JSONDecodeError:
        print('Response is not valid JSON')
else:
    print('Request failed')
