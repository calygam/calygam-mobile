import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Routes from './src/routes/TabNavigatorBottom';
import Onboarding from './src/screens/OnboardingScreens/Onboarding';
import LoginScreen from './src/screens/LoginPage/LoginScreen';
import SignUpScreen from './src/screens/LoginPage/SignUpScreen';
import PageAtividade from './src/screens/PageActivity/PageAtividade';
import Trail from './src/screens/TrailPage/Trail';
import * as Linking from 'expo-linking'
import React, { useEffect, useState } from 'react';
import { AuthContext, AuthProvider } from './src/hooks/AuthContext';
import { View, Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertProvider } from './src/components/ModaisAlertas/AlertProvider';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from './src/utils/RootNavigation';

// Configure Google Signin
GoogleSignin.configure({
    webClientId: '810580691936-4bck7sg06e22td5q4da83jfir8i0gbga.apps.googleusercontent.com', // Troque pelo seu Web Client ID do Google Console
    offlineAccess: true,
});

const Stack = createNativeStackNavigator();

const devPrefix = Linking.createURL('/');
const linking = {
    // Usa prefixo do dev (exp://...) e o esquema nativo estático "Calygam://"
    prefixes: ['Calygam://', devPrefix],
    config: {
        screens: {
            home: 'home'
        }
    }
}

function ErrorBoundary({ children }) {
    const [hasError, setHasError] = useState(false);
    useEffect(() => {
        const handler = (error, isFatal) => {
            console.warn('ErrorBoundary capturou:', error, isFatal);
            setHasError(true);
        };
        const subscription = (ErrorUtils && ErrorUtils.setGlobalHandler)
            ? ErrorUtils.setGlobalHandler(handler)
            : null;
        return () => {
            if (subscription && ErrorUtils?.setGlobalHandler) {
                ErrorUtils.setGlobalHandler(null);
            }
        };
    }, []);
    if (hasError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', textAlign: 'center', padding: 20 }}>
                    Ocorreu um erro inesperado na interface. Tente atualizar a tela.
                </Text>
            </View>
        );
    }
    return children;
}

export default function App() {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // pra mostrar splash
    const [hasBackendToken, setHasBackendToken] = useState(false);

    useEffect(() => {
        const unsubFirebase = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        // também considera token do backend para manter usuário na home durante erros/hot reload
        const loadBackendToken = async () => {
            try {
                const t = await AsyncStorage.getItem('userToken');
                setHasBackendToken(!!t);
            } catch {}
            setLoading(false);
        };
        loadBackendToken();

        // Limpa o listener quando desmontar
        return () => unsubFirebase();
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
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <BottomSheetModalProvider>
                        <AlertProvider>
                          <NavigationContainer linking={linking} ref={navigationRef}>
                              <ErrorBoundary>
                                  <Stack.Navigator initialRouteName={(user || hasBackendToken) ? "home" : "Login"} screenOptions={{ headerShown: false }}>
                                  <Stack.Screen name="Trilha" component={Trail} />
                                  {/* Home SEMPRE registrada */}
                                  <Stack.Screen name="home" component={Routes}/>
                                  {/* Telas de auth sempre registradas para permitir reset após logout */}
                                  <Stack.Screen name="Login" component={LoginScreen} />
                                  <Stack.Screen name="SignUpScreen" component={SignUpScreen}/>
                                  {/* Atividade */}
                                  <Stack.Screen name="Atividade" component={PageAtividade}/>
                              </Stack.Navigator>
                              </ErrorBoundary>
                          </NavigationContainer>
                        </AlertProvider>
                    </BottomSheetModalProvider>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </AuthProvider>
    );
}

