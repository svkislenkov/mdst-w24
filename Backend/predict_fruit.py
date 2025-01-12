import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os

import cv2

img = cv2.imread('apple.png')
resize = tf.image.resize(img, (100, 100))
resize_rgb = tf.reverse(resize, axis=[-1])

np.expand_dims(resize_rgb, 0).shape


model = tf.keras.models.load_model('fruitclassifier.keras')
yhat = model.predict(np.expand_dims(resize_rgb/255, 0))

predicted_class_index = np.argmax(yhat[0])


import ast

# Path to the file containing the printed dictionary
file_path = "directories.txt"

# Read the file and parse the dictionary
with open(file_path, 'r') as file:
    content = file.read()
    fruits_dict = ast.literal_eval(content)


whole_fruit = fruits_dict[predicted_class_index]

# Fetches the first word of the fruit class
fruit = whole_fruit.split()[0]
print(fruit)


