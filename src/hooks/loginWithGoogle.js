import * as React from "react";
import { useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import { Linking } from "react-native";


const BACKEND_URL = "https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/auth/google";
const CLIENT_ID = "810580691936-4bck7sg06e22td5q4da83jfir8i0gbga.apps.googleusercontent.com"

export default function useGoogleLogin() {
    // Cria o redirect URI pro Expo Go
    const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true, // importante pro Expo Go
        // projectNameForProxy: "@mr_cat/Calygam",
    });
    console.log('Redirect URI:', redirectUri);

// Descoberta da URL de autenticação
    const discovery = {
        authorizationEndpoint: BACKEND_URL,
        tokenEndpoint: "", // se o backend gerar o token, pode ficar vazio
    };
    
// Cria a requisição de autenticação
const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
        clientId: CLIENT_ID, // Placeholder, backend usa o real
        redirectUri,
        scopes: ["profile", "email"],
        extraParams: {
            redirect_uri: redirectUri, // Passa pro backend
        },
    },
    discovery
);

// Captura o resultado quando o usuário volta do Google
useEffect(() => {
    if (response?.type === "success") {
        console.log("Login sucesso:", response.params);
        // Aqui você pode pegar o token que o backend passou via redirect
        // e salvar no AsyncStorage ou contexto global
    } else if (response?.type === "error") {
        console.log("Erro no login:", response.error);
    }
}, [response]);

// Função que vai ser chamada no botão
const goToGoogle = () => {
    promptAsync(BACKEND_URL); 
    // Linking.openURL(BACKEND_URL) // abre o navegador pro Google login
};

return { goToGoogle, request };
}