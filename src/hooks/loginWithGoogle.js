import React, { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
// import * as SecureStore from 'expo-secure-store';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import api from '../api/api';

// Completa a sessão do navegador
WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = '810580691936-4bck7sg06e22td5q4da83jfir0gbga.apps.googleusercontent.com';
const SECURE_AUTH_KEY = 'GoogleAuthState';

export default function useGoogleLogin() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cria o redirect URI
    const redirectUri = makeRedirectUri({
        useProxy: true, // Força proxy do Expo em dev[](https://auth.expo.dev/@mr_cat/CalygamMobile)
        scheme: 'calygam', // Fallback pra build standalone
    });
    console.log('Redirect URI:', redirectUri); // Debug

    // Configura o hook de autenticação
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: CLIENT_ID,
        redirectUri,
        scopes: ['profile', 'email', 'openid'],
    });

    // Aquecimento do navegador (melhora UX no Android)
    useEffect(() => {
        if (Platform.OS === 'android') {
            WebBrowser.warmUpAsync();
            return () => {
                WebBrowser.coolDownAsync();
            };
        }
    }, []);

    // Captura o resultado do login
    useEffect(() => {
        console.log('Response:', response); // Debug
        if (response?.type === 'success') {
            const { authentication } = response;
            fetchUserInfo(authentication.accessToken);
        } else if (response?.type === 'error') {
            setError('Erro no login: ' + (response.error || 'Desconhecido'));
            setLoading(false);
        }
    }, [response]);

    // Busca infos do usuário e envia pro backend
    const fetchUserInfo = async (accessToken) => {
        setLoading(true);
        try {
            console.log('Access Token:', accessToken); // Debug
            // Pega infos do usuário na Google API
            const userResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userData = await userResponse.json();
            setUserInfo(userData);
            console.log('User Info:', userData); // Debug

            // Armazena o token no SecureStore
            if (Platform.OS !== 'web') {
                await SecureStore.setItemAsync(SECURE_AUTH_KEY, JSON.stringify({ accessToken }));
            }

            // Envia pro backend
            console.log('Enviando pro backend:', { access_token: accessToken });
            const backendResponse = await api.post('/auth/google', {
                access_token: accessToken,
            });
            console.log('JWT do backend:', backendResponse.data); // Debug
        } catch (err) {
            setError('Erro: ' + err.message);
            console.error('Erro detalhado:', err); // Debug
        } finally {
            setLoading(false);
        }
    };

    // Função pro botão de login
    const goToGoogle = () => {
        if (request) {
            promptAsync({ useProxy: true, showInRecents: false }); // Força proxy e evita fluxo nativo
        } else {
            console.log('Request não inicializado ainda.');
        }
    };

    // Recupera token salvo
    const restoreSession = async () => {
        if (Platform.OS !== 'web') {
            const storedAuth = await SecureStore.getItemAsync(SECURE_AUTH_KEY);
            if (storedAuth) {
                const { accessToken } = JSON.parse(storedAuth);
                fetchUserInfo(accessToken);
            }
        }
    };

    return { goToGoogle, restoreSession, request, userInfo, loading, error };
}