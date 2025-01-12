import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageViewer from "../../components/ImageViewer";

const PlaceholderImage = require("@/assets/images/background-image.png");

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<{ uri: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);

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

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {showCamera ? (
          <CameraView style={styles.camera} facing={facing}>
            <View style={styles.buttonContainer}>
            </View>
          </CameraView>
        ) : (
          <ImageViewer imgSource={photo || PlaceholderImage} />
        )}
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => setShowCamera(!showCamera)}
        >
          <Text style={styles.mainButtonText}>
            {showCamera ? "Cancel" : "Take a photo"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => {
            // Add your nutrition info logic here
            console.log("Getting nutrition info...");
          }}
        >
          <Text style={styles.mainButtonText}>Get Nutrition Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e'

  },
  imageContainer: {
    flex: 2,
    width: '100%',
    height: '100%',
    overflow: 'hidden'
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
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
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
});
