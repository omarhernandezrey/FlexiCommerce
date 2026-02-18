import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';

export default function HomeScreen() {
  // Placeholder home screen
  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={(item) => item.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
