import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Routes from './src/routes/TabNavigatorBottom';
import Onboarding from './src/screens/OnboardingScreens/Onboarding';
import LoginScreen from './src/screens/LoginPage/LoginScreen';
import SignUpScreen from './src/screens/LoginPage/SignUpScreen';
import * as Linking from 'expo-linking'
import React, { useEffect, useState } from 'react';
import { AuthContext, AuthProvider } from './src/hooks/AuthContext';
import { View, Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase';
import Modal from './src/components/BottomSheetModalPerfil/Modalperfil';


import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Signin
GoogleSignin.configure({
    webClientId: '810580691936-4bck7sg06e22td5q4da83jfir8i0gbga.apps.googleusercontent.com', // Troque pelo seu Web Client ID do Google Console
    offlineAccess: true,
});

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

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // pra mostrar splash

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false); // terminou de checar
        });

        // Limpa o listener quando desmontar
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            // Tela de splash (pode ser um logo girando)
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{color: '#FFF'}}>Carregando...</Text>
            </View>
        );
    }

    return (
        <AuthProvider>
            <SafeAreaProvider>
                <NavigationContainer linking={linking}>
                    <Stack.Navigator initialRouteName={user ? "home" : "Login"}>
                        {user ? (
                            // Usuário está logado -> ele vai para a home
                            <Stack.Screen name="home" component={Routes} options={{ headerShown: false }} />
                        ) : (
                            // Usuário não está logado -> ele vê as telas de onboarding/login/signup
                            <>
                                {/* <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} /> */}
                                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
                            </>
                        )}
                    </Stack.Navigator>
                    
                </NavigationContainer>
            </SafeAreaProvider>
        </AuthProvider>
    );
}

