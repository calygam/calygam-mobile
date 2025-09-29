import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function CardsTrilhas() {
    return (
        <View style={styles.container}>
            <View style={styles.BoxCard}>
                <View style={styles.FotoTrilha}>
                </View>

                <View style={styles.Infomações}>

                </View>

                <View style={styles.FotoIconTrilha}>

                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0D1912',
        borderWidth: 2,
        borderColor: '#FFF',
        width: 300,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        padding: 11,
    },
    BoxCard: {
        flexDirection: 'row',
        gap: 10
    },
    FotoTrilha: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 15
    },
    Infomações: {
        backgroundColor: '#0089ED',
        width: 150,
        height: 50
    },
    FotoIconTrilha: {
        backgroundColor: '#D9904B',
        height: 50,
        width: 50
    }
})