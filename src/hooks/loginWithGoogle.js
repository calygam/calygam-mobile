import * as React from "react";
import { useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from 'expo-auth-session';
import api from "../api/api";



const BACKEND_URL = "https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/auth/google";
const CLIENT_ID = "810580691936-4bck7sg06e22td5q4da83jfir0gbga.apps.googleusercontent.com";

export default function useGoogleLogin() {
    // Cria o redirect URI seguro pro Expo Go
    const redirectUri = makeRedirectUri({
        useProxy: true,       // ⚠️ importante no Expo Go
        scheme: "calygam"   // precisa bater com o app.json se for standalone
    });

    console.log("Redirect URI:", redirectUri);

    // Descoberta da URL de autenticação (backend)
    const discovery = {
        authorizationEndpoint: BACKEND_URL,
        tokenEndpoint: "", // deixa vazio se o backend gera o token
    };

    // Cria a requisição de autenticação
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: CLIENT_ID,
            redirectUri,
            scopes: ["profile", "email"],
            extraParams: {
                redirect_uri: redirectUri, // manda pro backend
            },
        },
        discovery
    );

    // Captura o resultado quando o usuário volta do Google
    useEffect(() => {
        if (response?.type === "success") {
            console.log("Login sucesso:", response.params);
            // Aqui você pega o token do backend e salva no AsyncStorage ou contexto global
        } else if (response?.type === "error") {
            console.log("Erro no login:", response.error);
        }
    }, [response]);

    // Função chamada no botão de login
    const goToGoogle = () => {
        if (request) {
            promptAsync({useProxy: true}); // Abre o login
        } else {
            console.log("Request não inicializado ainda.");
        }
    };

    return { goToGoogle, request };
}
