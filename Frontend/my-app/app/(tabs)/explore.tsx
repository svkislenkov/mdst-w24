import React, { useRef, useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import {
  Camera,
  CameraType,       // <- Make sure this is an actual enum/value
  useCameraPermissions,
} from "expo-camera";

export default function ExploreScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [classification, setClassification] = useState<string>("");

  // Notice: we import { Camera } as a real component, so we can use it in JSX,
  // and here we just do useRef<Camera>(...) 
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setPhotoUri(photo.uri);
      if (photo.base64) {
        const result = await sendImageToBackend(photo.base64);
        setClassification(result);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  const sendImageToBackend = async (base64: string) => {
    try {
      const response = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      return data.classification;
    } catch (error) {
      console.error("Error from server:", error);
      return "Error classifying image";
    }
  };

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (!permission.granted) {
    return <Text>No access to the camera.</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}  // This should work if your expo-camera version supports CameraType as an enum
      />
      <Button title="Take Picture" onPress={takePicture} />
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      )}
      {classification ? (
        <Text style={styles.classificationText}>
          Classification: {classification}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  preview: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginVertical: 10,
  },
  classificationText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
});