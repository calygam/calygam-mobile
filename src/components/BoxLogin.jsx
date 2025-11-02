import { View, StyleSheet, Dimensions, Alert } from 'react-native'
import React, { useState, useEffect } from "react";
import FormGenerico from './FormGenerico';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window')

export default function BoxLogin() {

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: "996401956233-e598ntk7edg86tmb2731ie4d7evor7d1.apps.googleusercontent.com", // vem do console do Firebase ou Google Cloud
            offlineAccess: true,
            scopes: ["profile", "email"],
            forceCodeForRefreshToken: true, // PRA TROCA DE CONTA
        });
    }, []);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    // Login com o Google
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            const { idToken } = await GoogleSignin.signIn();
            console.log("ID Token recebido:", !!idToken);

            if (!idToken) throw new Error("ID Token não retornado");

            // CORRETO: GoogleAuthProvider.credential + signInWithCredential
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            // CORRETO: use .user
            const user = userCredential.user;

            const userInfo = {
                uid: user.uid,
                displayName: user.displayName || user.email.split("@")[0], // ← fallback
                email: user.email,
                photoURL: user.photoURL,
            }

            console.log("Usuário logado:", userInfo);

            // ENVIA PARA O SEU BACKEND
            const response = await axios.post("http://10.0.0.191:8080/auth/googlereact", userInfo);
            const { token } = response.data; // ← JWT DO BACKEND
            if (response.status === 200 || response.status === 201) {
                await AsyncStorage.setItem("userToken", token);
                await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
                navigation.replace("home");
            }

        } catch (error) {
            console.error("ERRO COMPLETO:", error);
            console.error("Erro no login Google:", error.response?.data || error.message);
            Alert.alert("Erro", error.response?.data?.message || "Falha ao salvar usuário");
        } finally {
            setLoading(false);
        }
    };

    // Login sem o Google aqui o usuario vem pra cá se ele não quer fazer o login com o Google ai ele vai ter que ser
    // Cadastrar
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
                            value: email,
                            onChangeText: setEmail,
                        },
                        {
                            label: 'Digite sua Senha',
                            placeholder: 'Digite sua Senha:',
                            value: senha,
                            onChangeText: setSenha,
                            secureTextEntry: true,
                        },
                    ]}

                    buttonText="Entrar"
                    onSubmit={handleLogin}
                    GoogleButton={signInWithGoogle}
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