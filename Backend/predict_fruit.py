from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import ast
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    image_bytes = file.read()
    img_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    
    if img is None:
        return jsonify({'error': 'Could not read the image file'}), 400

    # Add debug prints for image processing
    print(f"Original image shape: {img.shape}")
    
    resize = tf.image.resize(img, (100, 100))
    resize_rgb = tf.reverse(resize, axis=[-1])

    # Add debug print for preprocessed image
    print(f"Preprocessed image shape: {resize_rgb.shape}")

    # Predict
    model = tf.keras.models.load_model('Backend/fruitclassifier.keras')
    yhat = model.predict(np.expand_dims(resize_rgb/255, 0))
    
    # Get top 5 predictions with their probabilities
    top_indices = np.argsort(yhat[0])[-5:][::-1]
    top_probabilities = yhat[0][top_indices]
    
    print("Top 5 predictions:")
    for idx, prob in zip(top_indices, top_probabilities):
        print(f"Class {idx}: {prob*100:.2f}% confidence")
    
    # Load fruits dictionary
    with open("Backend/directories.txt", 'r') as file:
        content = file.read()
        fruits_dict = ast.literal_eval(content)
    
    print(f"Available class range: {min(fruits_dict.keys())} to {max(fruits_dict.keys())}")

    # Try each prediction until we find one in our dictionary
    for pred_class, confidence in zip(top_indices, top_probabilities):
        pred_class = int(pred_class)
        if pred_class in fruits_dict:
            whole_fruit = fruits_dict[pred_class]
            fruit = whole_fruit.split()[0]
            return jsonify({
                'fruit': fruit,
                'confidence': float(confidence),
                'class_id': pred_class
            })

    # If none of the predictions are in our dictionary
    return jsonify({
        'error': 'Could not classify image with confidence',
        'attempted_classes': [int(i) for i in top_indices],
        'probabilities': [float(p) for p in top_probabilities],
        'available_classes': list(fruits_dict.keys())
    }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)


