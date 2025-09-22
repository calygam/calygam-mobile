import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Dimensions } from 'react-native';
import BoxLogin from '../../components/BoxLogin';

// Aqui nessa página eu estou usando para renderizar meu componente BoxLogin
// E criando ou Definindo meus Textos de Bem-Vindo e nosso Fundo Branco que tem um efeito na tela de duas metades de cores uma Roxa e a outra metade Branca

const { width, height } = Dimensions.get("window");
 
export default function LoginScreen() {
    return (
        <View style={styles.container}>
            {/* Titulo De Boas-Vindas */}
            <View style={styles.TitleWelcome}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '300' }}>Olá Bem-Vindo</Text>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', alignItems: 'center', justifyContent: 'center' }}>Ao Calygam</Text>
            </View>

            {/* ParteLogin */}
            <BoxLogin />

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
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%'
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