import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native'
import React from 'react'
import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import FormGenerico from './FormGenerico';

const { width, height } = Dimensions.get('window')

export default function BoxSignUp() {

    const navigation = useNavigation();

    return (
        <View>
            <View style={styles.BoxLogin}>
                <FormGenerico
                    title='Criar'
                    fields={[
                        { label: 'Digite seu endereço de e-mail', placeholder: 'Nome de usuário ou endereço de e-mail: ' },
                        { label: 'Username', placeholder: 'Nome de Usuario: ' },
                        { label: 'Digite sua senha', placeholder: 'Digite sua senha: ' },
                    ]}
                    buttonText='Inscreva-se'
                    onSubmit={() => alert("Conta criada com Sucesso! volte para a tela de Login!")}
                    NãoTem='Tem uma conta?'
                    linkText='Entrar'
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    BoxLogin: {
        backgroundColor: '#FFF',
        zIndex: 1,
        width: width * 0.9,
        height: height * 0.7,
        borderRadius: 30,
        marginVertical: 30
    }
})