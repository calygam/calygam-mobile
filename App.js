import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StackRoutes from './src/routes/StackNavigator';
import Routes from './src/routes/TabNavigatorBottom';
import Onboarding from './src/screens/OnboardingScreens/Onboarding';
import LoginScreen from './src/screens/LoginPage/LoginScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Onboarding">
                    <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Home" component={Routes} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

