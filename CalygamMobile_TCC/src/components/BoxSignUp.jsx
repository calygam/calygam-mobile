import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { createStaticNavigation, useNavigation } from '@react-navigation/native';

export default function BoxSignUp() {

    const navigation = useNavigation();

 return (
        <View>
            <View style={styles.BoxLogin}>
                <View style={styles.content}>

                    {/* Textos */}
                    <View style={{ flexDirection: 'row', gap: 35, alignItems: 'center' }}>
                        <Text style={{ fontSize: 35, color: '#000', fontWeight: '600' }}>Criar</Text>
                        <View style={styles.row}>
                            <Text style={{ fontSize: 13, color: '#8D8D8D', fontWeight: '500' }}>Tem uma conta?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={{ fontSize: 13, color: '#6C63FF', fontWeight: '500' }}>Entrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Inputs */}
                    <View style={styles.containerInput}>
                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>Digite seu endereço de e-mail</Text>
                        <TextInput style={styles.styleInput} placeholder='Endereço de e-mail: '></TextInput>
                    </View>
                    <View style={styles.containerInput}>
                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>Username</Text>
                        <TextInput style={styles.styleInput} placeholder='Nome de Usuario: '></TextInput>
                    </View>
                    <View style={styles.containerInput}>
                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>Digite sua senha</Text>
                        <TextInput style={styles.styleInput} placeholder='Digite sua senha: '></TextInput>
                    </View>

                    {/* ButtonEntrar */}
                    <View>
                        <TouchableOpacity style={styles.Button}>
                            <Text style={{ color: '#FFF', fontSize: 16}}>Inscrever-se</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    BoxLogin: {
        backgroundColor: '#FFF',
        zIndex: 1,
        width: 270,
        height: 550,
        borderRadius: 30,
        marginVertical: 20,
    },
    content: {
        paddingHorizontal: 25,
        paddingVertical: 25,
        gap: 25
    },
    containerInput: {
        gap: 10,
        justifyContent: 'center',
    },
    styleInput: {
        borderColor: '#ADADAD', // Cor da borda
        borderWidth: 1.5,      // Espessura da borda
        borderRadius: 10,     // Cantos arredondados (opcional)
        paddingHorizontal: 10, // Espaçamento interno
        fontSize: 13,
        fontWeight: '300',
        width: '100%',
        height: 55
    },
    Button: {
        backgroundColor: '#0089ED',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 50,
        borderRadius: 10
    }
})