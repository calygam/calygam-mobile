// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        const loadToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setUserToken(token);
        };
        loadToken();
    }, []);

    const signIn = async (token) => {
        await AsyncStorage.setItem('token', token);
        setUserToken(token);
    };

    const signOut = async () => {
        await AsyncStorage.removeItem('token');
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
