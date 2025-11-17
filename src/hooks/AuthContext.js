// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        const loadToken = async () => {
            // Migra chave antiga 'token' -> 'userToken' se necessário
            const legacyToken = await AsyncStorage.getItem('token');
            const storedToken = await AsyncStorage.getItem('userToken');
            if (!storedToken && legacyToken) {
                await AsyncStorage.setItem('userToken', legacyToken);
                await AsyncStorage.removeItem('token');
            }
            setUserToken(storedToken || legacyToken || null);
        };
        loadToken();
    }, []);

    const signIn = async (token) => {
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
    };

    const signOut = async () => {
        try {
            // Desloga de provedores (se aplicável)
            try { await GoogleSignin.signOut(); } catch {}
            try { await auth.signOut(); } catch {}

            // Remove todas as chaves relevantes
            const keysToClear = [
                'userToken',
                'token', // legado
                'userInfo',
                'userRole',
                'trailProgress',
                'joinedTrail',
                'selectedTrail',
                'currentTrail',
            ];
            await AsyncStorage.multiRemove(keysToClear);

            // Limpeza extra de chaves com prefixo (trailUnlocked:*, currentTrail:*)
            try {
                const allKeys = await AsyncStorage.getAllKeys();
                const prefixed = allKeys.filter(k => k.startsWith('trailUnlocked:') || k.startsWith('currentTrail:') || k.startsWith('joinedTrails:'));
                if (prefixed.length) {
                    await AsyncStorage.multiRemove(prefixed);
                }
            } catch {}
        } finally {
            setUserToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
