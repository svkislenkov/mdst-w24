import { Text, View, StyleSheet, SafeAreaView } from "react-native";
import ImageViewer from "../../components/ImageViewer";
import Button from "../../components/Button";
import { Image } from "react-native";

import { CameraView, CameraType, useCameraPermissions} from "expo-camera";  

  import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useState, useRef, useEffect } from "react";

const PlaceholderImage = require("@/assets/images/background-image.png");

export default function Index() {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [showCamera, setShowCamera] = useState(true);

  // const[cameraType, setCameraType] = useState(CameraType.Constants.back);

  // function toggleCameraType() {
  //   setCameraType((current) =>
  //     current === CameraType.back ? CameraType.front : CameraType.back
  //   );
  // }

  // Request camera permission
  useEffect(() => {
    (async () => {
      const cameraPermission = await CameraView.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>;
  } else if (!hasCameraPermission) {
    return <Text>Camera permission is required</Text>;
  }

  // Handle taking photo
  const takePhoto = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: true,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
    setShowCamera(false);
  };

  if (photo) {
    let sharePic = async () => {
      await shareAsync(photo.uri);
    };

    let savePhoto = async () => {
      if (hasMediaLibraryPermission) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setPhoto(undefined);
        setShowCamera(true);
      } else {
        alert("No permission to save photo");
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <Button theme="primary" label="Share" onPress={sharePic} />
        <Button theme="primary" label="Save" onPress={savePhoto} />
        <Button
          theme="primary"
          label="Discard"
          onPress={() => {
            setPhoto(undefined);
            setShowCamera(true);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <CameraView type={CameraView.Constants.Type.back}>
        <View style={styles.buttonContainer}>
          <Button theme="primary" label="Take Photo" onPress={takePhoto} />
        </View>
      </CameraView>
      ) : (
        <>
          <View style={styles.imageContainer}>
            <ImageViewer
              imgSource={photo ? { uri: photo.uri } : PlaceholderImage}
            />
          </View>
          <View style={styles.footerContainer}>
            <Button
              theme="primary"
              label="Take a photo"
              onPress={() => setShowCamera(true)}
            />
            <Button label="Get Nutrition Info" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    paddingBottom: 40,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  preview: {
    alignSelf: "stretch",
    flex: 1,
  },
});
