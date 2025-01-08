import { Text, View, StyleSheet } from 'react-native';


export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
      🥑 </Text>
      <Text style={styles.text}>
      Fruit Nutrition Info App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 30
  },
  button: {
    fontSize: 100,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
