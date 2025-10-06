import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'

export default function ShopPage() {
  return (
     <View style={styles.container}>
      <Text>Bem-Vindo ao Shop Page 📦</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#0FFF',
        paddingTop: 55,
        gap: 35
    },
})
    