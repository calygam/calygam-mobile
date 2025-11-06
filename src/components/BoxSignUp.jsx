import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native'
import React, { useState } from "react";
import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import FormGenerico from './FormGenerico';
import api from '../api/api';
import axios from 'axios';


const { width, height } = Dimensions.get('window')

export default function BoxSignUp() {
    const navigation = useNavigation();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const handleCadastro = async () => {
        // Validação simples antes de enviar
        if (!nome || !email || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        try {
            // Faz a requisição para o seu backend
            const response = await axios.post("https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/auth/register", {
                userName: nome,
                userEmail: email,
                userPassword: senha,
            });

            if (response.status === 201 || response.status === 200) {
                Alert.alert("Sucesso", "Conta criada com sucesso!");
                // Aqui você pode redirecionar o usuário para a tela de login, por exemplo
                navigation.navigate('Login');
            }
        } catch (error) {
            console.log(error);
            // Trata erro vindo do backend
            if (error.response) {
                Alert.alert("Erro", error.response.data.message || "Falha ao criar conta");
            } else {
                Alert.alert("Erro", "Não foi possível conectar ao servidor");
            }
        }
    };


    return (
        <View>
            <View style={styles.BoxLogin}>
                <FormGenerico
                    title='Criar'
                    fields={[
                        {
                            label: 'Digite seu endereço de e-mail',
                            placeholder: 'Nome de usuário ou endereço de e-mail: ',
                            value:email,
                            onChangeText: setEmail
                            
                        },
                        {
                            label: 'Username',
                            placeholder: 'Nome de Usuario: ',
                            value:nome,
                            onChangeText: setNome
                        },
                        {
                            label: 'Digite sua senha',
                            placeholder: 'Digite sua senha: ',
                            value: senha,
                            onChangeText: setSenha,
                            secureTextEntry: true
                        },
                    ]}
                    buttonText='Inscreva-se'
                    onSubmit={handleCadastro}
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