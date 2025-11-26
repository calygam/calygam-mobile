import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

export default function TestePet() {
    return (
        <View style={styles.container}>
            <View style={styles.CardContainer}>

                {/* Nome do Pet */}
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={styles.petName}>Nome do Pet</Text>
                </View>

                {/* Gif do Pet */}
                <View style={styles.petGifContainer}>

                </View>

                {/* Infomações do Pet */}
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: '#FFF' }}>Informações do Pet</Text>
                </View>

                {/* Botões de Ações */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 10 }}>
                    <TouchableOpacity>
                        <View style={{ width: 'auto', height: 50, backgroundColor: '#6C63FF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 20}}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Esconder</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style={{ width: 'auto', height: 50, backgroundColor: '#C1121F', borderRadius: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 20}}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Desequipar</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',

    },
    CardContainer: {
        width: '85%',
        height: 400,
        borderWidth: 8,
        borderColor: '#6C63FF',
        borderRadius: 50,
        backgroundColor: '#000',
    },
    petName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        borderWidth: 2.5,
        borderColor: '#6C63FF',
        borderRadius: 20,
        padding: 10,
        width: '80%',
        height: 'auto',
        textAlign: 'center',

    },
    petGifContainer: {
        height: '45%',
        width: '90%',
        marginTop: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 20,
    }
})