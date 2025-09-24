import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import Montanha from "../../../src/screens/HomePage/SvgMontanha/Montanha";
import Sun from './SvgMontanha/Sun';


export default function Homepage() {
    return (
        <View style={styles.container}>
            <View style={styles.background}>
                <LinearGradient
                    // Background Linear Gradient
                    colors={['rgba(51, 53, 255, 0.8)', 'transparent']}
                    style={styles.background}
                />
                <Sun />
                <Montanha />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', // Alinha o conteúdo a partir do topo
        alignItems: 'center', // Centraliza horizontalmente
    },
    background: {
        backgroundColor: '#FF7121', // Cor base laranja
        width: 350,
        height: 250,
        alignItems: 'flex-start', // Alinha o Montanha no topo dentro do background
        justifyContent: 'flex-start', // Alinha o Montanha no topo dentro do background
        position: 'absolute',
        top: 0, // Fixa o background no topo
    },
});