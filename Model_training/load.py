import os
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import torch.nn as nn
import torch.optim as optim

# Paths
base_dir = "fruits-360_dataset_100x100/fruits-360"
train_dir = os.path.join(base_dir, "Training")
test_dir = os.path.join(base_dir, "Test")

# Image transformations
transform = transforms.Compose([
    transforms.Resize((100, 100)),  # Resize to 100x100
    transforms.ToTensor(),          # Convert images to PyTorch tensors
    transforms.Normalize((0.5,), (0.5,))  # Normalize to [-1, 1]
])

# Load datasets
train_data = datasets.ImageFolder(root=train_dir, transform=transform)
test_data = datasets.ImageFolder(root=test_dir, transform=transform)

# Create data loaders
train_loader = DataLoader(train_data, batch_size=32, shuffle=True)
test_loader = DataLoader(test_data, batch_size=32, shuffle=False)

# Output # of different fruits
num_classes = len(train_data.classes)
print(f"Number of classes: {num_classes}")


