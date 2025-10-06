import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native'
import FormGenerico from './FormGenerico';
import useGoogleLogin from '../hooks/loginWithGoogle';
import Homepage from '../../src/screens/HomePage/Homepage';
// import ToGoogle from '../hooks/loginWithGoogle';


const { width, height } = Dimensions.get('window')

export default function BoxLogin() {
    const { goToGoogle } = useGoogleLogin();
    return (
        <View>
            <View style={styles.BoxLogin}>
                <FormGenerico
                    title='Entrar'
                    fields={[
                        { label: 'Digite seu endereço de Email', placeholder: 'Nome de usuário ou endereço de e-mail:' },
                        { label: 'Digite sua Senha', placeholder: 'Digite sua Senha:' },
                    ]}
                    buttonText="Entrar"
                    onHomePage={Homepage}
                    GoogleButton={goToGoogle}
                    // userInfo={userInfo}
                    NãoTem='Não tem Conta?'
                    linkText='Cadastre-se'
                />
            </View>
        </View>



    )
}

const styles = StyleSheet.create({
    BoxLogin: {
        backgroundColor: '#FFF',
        zIndex: 1,
        width: width * 0.9,
        height: height * 0.7,
        borderRadius: 30,
        marginVertical: 30
    }
})