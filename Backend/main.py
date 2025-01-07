from fastapi import FastAPI, Request
import torch
from PIL import Image
from torchvision import transforms
import uvicorn
from models import SimpleCNN, FruitsDataset  # Import the classes

# Load the dataset to get class labels
dataset = FruitsDataset(root_dir='/Users/maryjojohnson/Documents/mdst-w24/Model_training/fruits-360_dataset_100x100/fruits-360/Training', transform=None)  # Update the path
num_classes = len(set(dataset.labels))  # Ensure this matches the number of classes in your checkpoint

# Load the model
model = SimpleCNN()

# Check if the number of classes matches
if num_classes != 141:  # Assuming 141 is the number of classes in your checkpoint
    raise ValueError(f"Number of classes in the model ({num_classes}) does not match the checkpoint (141).")

model.load_state_dict(torch.load('/Users/maryjojohnson/Documents/mdst-w24/Backend/model/simple_cnn_model.pth'))
model.eval()

app = FastAPI()

@app.post("/")
async def post_request(request: Request):
    data = await request.json()
    image_path = data.get('image_path')

    image = Image.open(image_path).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((100, 100)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    image = transform(image)
    image = image.unsqueeze(0)

    with torch.no_grad():
        output = model(image)
        _, predicted = torch.max(output, 1)

    index_to_label = {v: k for k, v in dataset.label_to_index.items()}
    predicted_label = index_to_label[predicted.item()]

    return {"predicted_label": predicted_label}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

