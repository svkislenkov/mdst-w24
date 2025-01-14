import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import ImageViewer from "../../components/ImageViewer";

const PlaceholderImage = require("@/assets/images/background-image.png");

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<{ uri: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [predictedFruit, setPredictedFruit] = useState<string>("");
  const [showPrediction, setShowPrediction] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setPhoto(photo);
        setShowCamera(false);
      } else {
        console.error("Failed to capture photo");
      }
    }
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function getPredictedFruit() {
    if (!photo) {
      console.error("No photo taken yet");
      return;
    }

    try {
      console.log("Photo object:", photo);

      const formData = new FormData();
      const imageData = {
        uri: photo.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      };
      console.log("Image data being sent:", imageData);

      formData.append("image", imageData as any);

      console.log("Sending POST request to server...");
      const response = await fetch("http://192.168.1.135:5003/predict", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      const data = JSON.parse(responseText);
      if (!data.fruit) {
        console.error("No fruit data in response:", data);
        return null;
      }

      setPredictedFruit(data.fruit);
      return data.fruit;
    } catch (error) {
      console.error("Error in getPredictedFruit:", error);
      return null;
    }
  }

  async function getNutritionInfo() {
    try {
      const fruit = await getPredictedFruit();
      if (!fruit) {
        console.error("No fruit prediction available");
        return;
      }

      const APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
      const APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;

      const response = await fetch(
        `https://api.edamam.com/api/nutrition-data?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${fruit}%201`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setNutritionData(data.totalNutrients);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching nutrition info:", error);
    }
  }

  const handlePrediction = async () => {
    if (photo) {
      const fruit = await getPredictedFruit();
      if (fruit) {
        setPredictedFruit(fruit);
        setShowPrediction(true);
      }
    }
  };

  const handleShowCamera = () => {
    setShowCamera(!showCamera);
    setShowPrediction(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {showCamera ? (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePhoto}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <>
            <ImageViewer imgSource={photo || PlaceholderImage} />
            {showPrediction && predictedFruit && (
              <Text style={styles.predictionText}>
                Predicted Fruit: {predictedFruit}
              </Text>
            )}
          </>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Nutrition Information</Text>
          {nutritionData && (
            <View>
              <Text>
                Calories: {nutritionData.ENERC_KCAL?.quantity.toFixed(1)}{" "}
                {nutritionData.ENERC_KCAL?.unit}
              </Text>
              <Text>
                Protein: {nutritionData.PROCNT?.quantity.toFixed(1)}{" "}
                {nutritionData.PROCNT?.unit}
              </Text>
              <Text>
                Carbs: {nutritionData.CHOCDF?.quantity.toFixed(1)}{" "}
                {nutritionData.CHOCDF?.unit}
              </Text>
              <Text>
                Fat: {nutritionData.FAT?.quantity.toFixed(1)}{" "}
                {nutritionData.FAT?.unit}
              </Text>
              <Text>
                Fiber: {nutritionData.FIBTG?.quantity.toFixed(1)}{" "}
                {nutritionData.FIBTG?.unit}
              </Text>
              <Text>
                Sugar: {nutritionData.SUGAR?.quantity.toFixed(1)}{" "}
                {nutritionData.SUGAR?.unit}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.mainButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.mainButton} onPress={handleShowCamera}>
          <Text style={styles.mainButtonText}>
            {showCamera ? "Cancel" : "Take a photo"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton} onPress={handlePrediction}>
          <Text style={styles.mainButtonText}>Predict Fruit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton} onPress={getNutritionInfo}>
          <Text style={styles.mainButtonText}>Get Nutrition Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  imageContainer: {
    flex: 2,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  footerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingBottom: 20,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    margin: 20,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  mainButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "white",
    marginVertical: 10,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333", // Dark gray text
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: 70,
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 35,
    padding: 5,
  },
  captureButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: "white",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: "auto",
    marginBottom: "auto",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  predictionText: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
});
