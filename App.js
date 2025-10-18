import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StackRoutes from './src/routes/StackNavigator';
import Routes from './src/routes/TabNavigatorBottom';
import Onboarding from './src/screens/OnboardingScreens/Onboarding';
import LoginScreen from './src/screens/LoginPage/LoginScreen';
import SignUpScreen from './src/screens/LoginPage/SignUpScreen';
import * as Linking from 'expo-linking'
import Homepage from './src/screens/HomePage/Homepage';
import React, { useEffect } from 'react';
import { AuthContext, AuthProvider } from './src/hooks/AuthContext';

// import * as dotenv from 'dotenv';

// dotenv.config(); // Carrega as variáveis do .env

const Stack = createNativeStackNavigator();

const prefix = Linking.createURL('/');

const linking = {
    prefixes: [prefix],
    config: {
        screens: {
            home: 'home'
        }
    }
}

export default function App() {

    useEffect(() => {
        const handleInitialUrl = async () => {
            const url = await Linking.getInitialURL();
            if (url) {
                const token = extrairToken(url);
                if (token) {
                    navigation.navigate('home', { token });
                }
            }
        };

        handleInitialUrl();

        const onReceiveURL = ({ url }) => {
            const token = extrairToken(url);
            if (token) {
                navigation.navigate('home', { token });
            }
        };

        const subscription = Linking.addEventListener('url', onReceiveURL);

        return () => subscription.remove();
    }, []);

    const extrairToken = (url) => {
        const paramsString = url.split('?')[1];
        if (!paramsString) return null;
        const params = new URLSearchParams(paramsString);
        return params.get('token');
    };

    return (
        <AuthProvider>
            <SafeAreaProvider>
                <NavigationContainer linking={linking}>
                    <Stack.Navigator initialRouteName="Onboarding">
                        <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="home" component={Routes} options={{ headerShown: false }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </AuthProvider>
    );
}

