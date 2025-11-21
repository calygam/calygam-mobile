import { View, StyleSheet, Dimensions, Alert } from 'react-native'
import React, { useState, useEffect } from "react";
import FormGenerico from './FormGenerico';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

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

            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            const user = userCredential.user;

            console.log("Usuário logado:", user.email);

            // ENVIA PARA O BACKEND
            // const response = await axios.post("https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/auth/google", userInfo);
            const response = await api.post("/auth/google", {
                uid: user.uid,
                displayName: user.displayName || user.email.split("@")[0],
                email: user.email,
                photoURL: user.photoURL,
            });
            console.log('Resposta da API:', response.data);

            const { token } = response.data; // ← JWT DO BACKEND
            if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
                throw new Error('Token não encontrado na resposta. Verifique o backend.');
            }

            const decoded = jwtDecode(token);
            const role = decoded.role || 'ALUNO'; // ← PEGA A ROLE DO USUÁRIO
            // console.log("Token recebido:", token);
            console.log("Role do usuário:", role);

            if (response.status === 200 || response.status === 201) {
                await AsyncStorage.setItem("userToken", token);
                const decoded = jwtDecode(token);
                const role = decoded.role || 'ALUNO';
                await AsyncStorage.setItem("userRole", role);

                // BUSCA O PERFIL COMPLETO DO BACKEND
                const profileResp = await api.get("/users/readOne", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const serverUser = profileResp.data.user ?? profileResp.data;

                // Cria o userInfo com prioridade para os dados do backend
                const userInfo = {
                    uid: serverUser.userId,
                    userName: serverUser.userName || user.displayName || user.email.split("@")[0],
                    email: serverUser.userEmail || user.email,
                    photoURL: serverUser.userImage || user.photoURL,
                    userXp: serverUser.userXp || 0,
                    userRank: serverUser.userRank || "NOVATO",
                    userMoney: serverUser.userMoney || 0,
                    userFood: serverUser.userFood || 0
                };

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
            // const response = await axios.post("https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/auth/login",
                const response = await api.post("/auth/login",
                {
                userEmail: email,
                userPassword: senha,
            });

            console.log("Token decodificado:", JSON.parse(atob(response.data.token.split(".")[1]))); // << importante para debug
            

            if (response.status === 200) {
                const { token, user } = response.data;

                // ADICIONE ESTE LOG PARA DEPURAR
                console.log("Objeto 'user' recebido do Backend (Login Manual):", user);
                console.log("user.userName:", user?.userName);

                if (!token) {
                    throw new Error('Token não encontrado na resposta do login manual.');
                }

                // 1. Decodificar e salvar o Token e a Role
                await AsyncStorage.setItem("userToken", token);
                const decoded = jwtDecode(token);
                const role = decoded.role || 'ALUNO';
                await AsyncStorage.setItem("userRole", role);

                // BUSCA O PERFIL COMPLETO DO BACKEND
                const profileResp = await api.get("/users/readOne", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const serverUser = profileResp.data.user ?? profileResp.data;

                // Cria o userInfo com prioridade para os dados do backend
                const userInfo = {
                    uid: serverUser.userId,
                    userName: serverUser.userName || email.split("@")[0],
                    email: serverUser.userEmail || email,
                    photoURL: serverUser.userImage || null,
                    userXp: serverUser.userXp || 0,
                    userRank: serverUser.userRank || "NOVATO",
                    userMoney: serverUser.userMoney || 0,
                    userFood: serverUser.userFood || 0
                };

                await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));

                Alert.alert("Sucesso", "Login realizado!");
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
                    loading={loading}
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