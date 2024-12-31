import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset
import os
from PIL import Image

class FruitsDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []
        self.label_to_index = {}

        for idx, label in enumerate(os.listdir(root_dir)):
            label_dir = os.path.join(root_dir, label)
            if os.path.isdir(label_dir):
                self.label_to_index[label] = idx
                for image_name in os.listdir(label_dir):
                    self.image_paths.append(os.path.join(label_dir, image_name))
                    self.labels.append(idx)

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        image = Image.open(image_path).convert('RGB')
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, torch.tensor(label)

dataset = FruitsDataset(root_dir='/Users/maryjojohnson/Documents/mdst-w24/Model_training/fruits-360_dataset_100x100/fruits-360/Training', transform=None)  # Update the path


class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2, padding=0)
        self.fc1 = nn.Linear(32 * 25 * 25, 128)  # Adjust based on image size
        self.fc2 = nn.Linear(128, len(set(dataset.labels)))  # Adjust based on number of classes

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 32 * 25 * 25)  # Flatten the tensor
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

