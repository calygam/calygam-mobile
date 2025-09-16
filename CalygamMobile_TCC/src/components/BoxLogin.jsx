import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import GoogleIcon from "../../assets/Svg/google.svg";// 👈 direto
import SignUpScreen from '../screens/LoginPage/SignUpScreen';

export default function BoxLogin() {

    const navigation = useNavigation();

    return (
        <View>
            <View style={styles.BoxLogin}>
                <View style={styles.content}>

                    {/* Textos */}
                    <View style={{ flexDirection: 'row', gap: 35, alignItems: 'center' }}>
                        <Text style={{ fontSize: 35, color: '#000', fontWeight: '600' }}>Entrar</Text>
                        <View style={styles.row}>
                            <Text style={{ fontSize: 13, color: '#8D8D8D', fontWeight: '500' }}>Não tem conta?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
                                <Text style={{ fontSize: 13, color: '#6C63FF', fontWeight: '500' }}>Cadastre-se</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ButtonGoogle */}
                    <View style={{ backgroundColor: '#E9F1FF', width: '100%', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                        <GoogleIcon width={30} height={30} />
                        <Text style={{ fontSize: 12, color: '#4285F4', fontWeight: '300' }}>Faça login com o Google</Text>
                    </View>

                    {/* Inputs */}
                    <View style={styles.containerInput}>
                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>Digite seu endereço de e-mail</Text>
                        <TextInput style={styles.styleInput} placeholder='Endereço de e-mail: '></TextInput>
                    </View>
                    <View style={styles.containerInput}>
                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>Digite sua senha</Text>
                        <TextInput style={styles.styleInput} placeholder='Digite sua senha: '></TextInput>
                    </View>

                    {/* ButtonEntrar */}
                    <View>
                        <TouchableOpacity style={styles.Button}>
                            <Text style={{ color: '#FFF', fontSize: 16 }}>Entrar</Text>
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
        // paddingBottom: 20,
        // paddingTop: 30
    },
    content: {
        // left: 20,
        // top: 30,
        paddingHorizontal: 25,
        paddingVertical: 25,
        gap: 30
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