import { View, Text, StyleSheet, Dimensions} from 'react-native'
import React from 'react'

// pega a largura e altura da tela
const { width, height } = Dimensions.get('window')

export default function OnboardingItem({item}) {

    // O item tem: title, description e SvgComponent
    const SvgImagem = item.SvgComponent;
  return (
    <View style ={[styles.container, {width}]}>
     <SvgImagem 
        width={width * 0.8}
        height={height * 0.4}
     />
    {/* Mostra o Titulo */}
    <Text style={styles.title}>{item.title}</Text>
    {/* Aqui Mostra a Descrição definidas nos OnboardingScreensSlides.js */}
    <Text style={styles.description}>{item.description}</Text>
    
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',     
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
        color: '#fff',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        color: '#fff',
    },
});