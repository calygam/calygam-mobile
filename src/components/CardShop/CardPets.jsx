import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import IconCoin from "../../../assets/svg/IconsInterface/coin.svg";

export default function CardPets({ nome, preco, imagem, onPress }) {
    return (
        <TouchableOpacity style={styles.Card} onPress={onPress} activeOpacity={0.8}>
            <Image source={imagem} style={styles.imagem} resizeMode='cover' />

            <View style={styles.TextPreco}>
                <Text style={styles.nomeCard}>{nome}</Text>

                <View style={styles.precoContainer}>
                    <IconCoin width={24} height={24} fill="#888" style={styles.icon} />
                    <Text style={styles.preco}>{preco}</Text>
                </View>
            </View>

            <View style={styles.botao}>
                <Text style={styles.textBotao}>Ver detalhes</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    Card: {
        backgroundColor: '#FFF',
        width: 150,
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        gap: 12,
        paddingBottom: 10
    },
    botao: {
        backgroundColor: '#8A38F5',
        width: 130,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    botaoDisabled: {
        backgroundColor: '#CCCCCC'
    },
    textBotao: {
        color: '#FFF'
    },
    nome: {
        color: '#000',
        fontSize: 16,
        marginTop: 10,
        fontWeight: '600',
    },
    imagem: {
        width: 150,
        height: 100,
        borderRadius: 15,
    },
    precoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 10
    },
    preco: {
        color: '#61758A',
        fontSize: 15,
        fontWeight: 'bold',
    },
    TextPreco: {
        width: '100%',
        paddingLeft: 10
    }
})