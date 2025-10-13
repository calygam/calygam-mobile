import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import React from 'react'
import GoogleIcon from "../../assets/svg/google.svg";
import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import useGoogleLogin from '../hooks/loginWithGoogle';
import loginWithGoogle from '../hooks/loginWithGoogle';
import Homepage from '../../src/screens/HomePage/Homepage';

// Aqui nessa página eu estou criando um formulario de Login Generico usando Props assim facilitando na hora de reutilizar os mesmos componentes
// onde eu defino como elas vão se comportar (Obs: Isso aqui e pra tela de Login e Cadastro) e 
// isso eu posso manipula-lás na Pagina de BoxLogin ou seja muda o valor delas.

export default function FormGenerico({ title, fields = [], buttonText, onHomePage, GoogleButton = false, linkText, NãoTem, userInfo}) {

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Titulos */}
      <View style={{ flexDirection: 'row', gap: '30%', alignItems: 'center' }}>
        <Text style={styles.title}>{title}</Text>
      
      {/* Textos não tem Conta? */}
      {linkText && (
        <View>
            {NãoTem && (
              <Text style={{ fontSize: 13, color: '#8D8D8D', fontWeight: '500' }}>{NãoTem}</Text>
            )}
          <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={{ fontSize: 13, color: '#6C63FF', fontWeight: '500' }}>{linkText}</Text>
          </TouchableOpacity>
        </View>
      )}
      </View>

      {/* ButtonGoogle */}
      {GoogleButton && (
        <TouchableOpacity onPress={GoogleButton} style={{ backgroundColor: '#E9F1FF', width: '100%', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10 }}>
          <GoogleIcon width={30} height={30} />
          <Text style={{ fontSize: 13, color: '#4285F4', fontWeight: '300' }}>Faça login com o Google</Text>
        </TouchableOpacity>
      )}


      {/* Inputs Como Email & Senha */}
      {fields.map((field, index) => (
        <View key={index} style={styles.inputContainer}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            placeholder={field.placeholder}
            secureTextEntry={field.secureTextEntry}
            style={styles.styleInput}
          />
        </View>
      ))}

      {userInfo && (
        <View style={{ marginTop: 20 }}>
          <Text>Logado com JWT: {userInfo.jwtToken}</Text>
        </View>
      )}

      {/* Botão De Entrar*/}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 25,
    gap: 30
  },
  inputContainer: {
    gap: 15,
    justifyContent: 'center',
    zIndex: 1
  },
  styleInput: {
    borderColor: '#ADADAD',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '300',
    width: '100%',
    height: 55
  },
  button: {
    backgroundColor: '#0089ED',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    borderRadius: 10,
    zIndex: 1
  },
  title: {
    fontSize: 35,
    color: '#000',
    fontWeight: '700'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16
  }
});