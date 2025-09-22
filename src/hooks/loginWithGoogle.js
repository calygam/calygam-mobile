import { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";
import { GOOGLE_CLIENT_ID, API_URL } from '@env';

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleLogin() {
    const [userInfo, setUserInfo] = useState(null);

    // Define o redirectUri pro endpoint do Back-end
    const redirectUri = 'https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/api/auth/google/callback';
    

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri: redirectUri,
        scopes: ["openid", "profile", "email"],
    });

    useEffect(() => {
        console.log("Response:", response); // Para depuração
        if (response?.type === "success") {
            // Tenta pegar o token da query string do redirecionamento
            if (response.url) {
                const urlParams = new URLSearchParams(response.url.split("?")[1]);
                const token = urlParams.get("token");
                if (token) {
                    console.log("Token extraído do redirecionamento:", token);
                    handleGoogleToken(token);
                } else {
                    console.warn("Nenhum token encontrado na URL:", response.url);
                }
            } else if (response.authentication?.access_token) {
                // Fallback pra caso o token venha direto do Google
                console.log("Token do Google:", response.authentication.access_token);
                handleGoogleToken(response.authentication.access_token);
            }
        } else if (response?.type === "error") {
            console.error("Erro na autenticação:", response.error);
            alert("Erro na autenticação: " + response.error.message);
        } else if (response?.type === "dismiss") {
            console.log("Usuário fechou o navegador");
            alert("Login cancelado pelo usuário");
        }
    }, [response]);

    async function handleGoogleToken(accessToken) {
        try {
            console.log("Access Token sendo processado:", accessToken); // Para depuração
            const response = await api.post(`${API_URL}/auth/google`, { token: accessToken });
            console.log("Backend response:", response.data); // Para depuração
            const jwtToken = response.data.token;
            await AsyncStorage.setItem("token", jwtToken);
            setUserInfo({ jwtToken });
            alert("Login bem-sucedido!");
        } catch (error) {
            console.error("Erro ao processar token:", error);
            alert("Erro ao processar login: " + error.message);
        }
    }

    async function loginWithGoogle() {
        try {
            console.log("Clicou no botão");
            console.log("Request:", request); // Para depuração
            if (!request) {
                alert("Configuração de autenticação não está pronta");
                return;
            }
            await promptAsync();
        } catch (error) {
            console.error("Erro ao iniciar login:", error);
            alert("Erro ao iniciar login: " + error.message);
        }
    }

    return { userInfo, loginWithGoogle };
}