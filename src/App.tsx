import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import PipeflowScreen from './screens/PipeflowScreen';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PipeflowScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
});

export default App;
