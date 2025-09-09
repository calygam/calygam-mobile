import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Dimensions } from 'react-native';
import BoxLogin from '../../components/BoxLogin';

export default function LoginScreen() {
    const { width, height } = Dimensions.get("window");

    return (
        <View style={styles.container}>
            {/* Titulo De Boas-Vindas */}
            <View style={styles.TitleWelcome}>
                <Text style={{ color: '#fff', fontSize: 24, zIndex: 0, fontWeight: '200' }}>Olá Bem-Vindo</Text>
                <Text style={{ color: '#fff', fontSize: 24, zIndex: 1}}>Ao Calygam</Text>
            </View>

            <BoxLogin/>
            

            {/* Fundo Branco */}
            <View style={styles.ViewBG}>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    TitleWelcome: {
        // backgroundColor: 'red',
        alignItems: 'center',
    },
    ViewBG: {
        position: "absolute",
        top: 350,
        left: 0,
        backgroundColor: '#FFF',
        width: '100%',
        height: 600,
        overflow: "hidden",
        zIndex: 0
    },

})