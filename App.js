import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding from './src/screens/OnboardingScreens/Onboarding';
import LoginScreen from './src/screens/LoginPage/LoginScreen';
import SignUpScreen from './src/screens/LoginPage/SignUpScreen';
import Homepage from './src/screens/HomePage/Homepage';
import BibliotecaCursos from './src/screens/PageBiblioteca/BibliotecaCursos';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="inverted" />
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="Home" component={Homepage} />
        <Stack.Screen name='BibliotecaCursos' component={BibliotecaCursos} />
        {/* se quiser adicionar Home depois */}
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

