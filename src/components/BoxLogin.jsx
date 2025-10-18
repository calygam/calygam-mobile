import { View, StyleSheet, Dimensions, Alert } from 'react-native'
import React, { useState } from "react";
import FormGenerico from './FormGenerico';
import useGoogleLogin from '../hooks/loginWithGoogle';
import { useNavigation } from '@react-navigation/native';
import Homepage from '../../src/screens/HomePage/Homepage';
// import ToGoogle from '../hooks/loginWithGoogle';
import TestarConexao from '../api/teste';
import axios from 'axios';

const { width, height } = Dimensions.get('window')

export default function BoxLogin() {
        const navigation = useNavigation();
    const { goToGoogle } = useGoogleLogin();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        try {
            const response = await axios.post("http://10.0.0.191:8080/auth/login", {
                userEmail: email,
                userPassword: senha,
            });

            if (response.status === 200) {
                Alert.alert("Sucesso", "Login realizado!");
                // Aqui você pode salvar o token se quiser
                // e navegar para a Home
                navigation.navigate('home');
            }
        } catch (error) {
            console.log(error);
            if (error.response) {
                Alert.alert("Erro", error.response.data.message || "Email ou senha incorretos");
            } else {
                Alert.alert("Erro", "Não foi possível conectar ao servidor");
            }
        }
    };

    return (
        <View>
            {/* <TestarConexao />; */}

            <View style={styles.BoxLogin}>
                <FormGenerico
                    title='Entrar'
                    fields={[
                        {
                            label: 'Digite seu endereço de Email',
                            placeholder: 'Nome de usuário ou endereço de e-mail:',
                            value:email,
                            onChangeText: setEmail,
                        },
                        {
                            label: 'Digite sua Senha',
                            placeholder: 'Digite sua Senha:',
                            value:senha,
                            onChangeText: setSenha,
                            secureTextEntry: true,
                        },
                    ]}
                    buttonText="Entrar"
                    onSubmit={handleLogin}
                    GoogleButton={goToGoogle}
                    // userInfo={userInfo}
                    NãoTem='Não tem Conta?'
                    linkText='Cadastre-se'
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