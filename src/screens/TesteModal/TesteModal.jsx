import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Modal from '../../components/BottomSheetModalPerfil/Modalperfil'

export default function TesteModal() {

  return (
    <View style={styles.container}>
        <Modal />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    }
})