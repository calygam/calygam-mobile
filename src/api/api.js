import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import * as RootNavigation from "../utils/RootNavigation";

// Remover Content-Type global de urlencoded dos defaults do axios
if (axios.defaults.headers) {
    if (axios.defaults.headers.post && axios.defaults.headers.post['Content-Type'] === 'application/x-www-form-urlencoded') {
        delete axios.defaults.headers.post['Content-Type'];
    }
    if (axios.defaults.headers.put && axios.defaults.headers.put['Content-Type'] === 'application/x-www-form-urlencoded') {
        delete axios.defaults.headers.put['Content-Type'];
    }
    if (axios.defaults.headers.common && axios.defaults.headers.common['Content-Type'] === 'application/x-www-form-urlencoded') {
        delete axios.defaults.headers.common['Content-Type'];
    }
}

const api = axios.create({
    // baseURL: "http://10.0.0.191:8080",
    baseURL: 'https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net'
})

api.interceptors.request.use(
    async(config) => {
        try { // O try Tenta pegar o token
            const token = await AsyncStorage.getItem('userToken') // Procurar no celular se existe um token salvo
            if (token) {
                // Garantir que não há headers undefined
                if (!config.headers) {
                    config.headers = {};
                }
                config.headers.Authorization = `Bearer ${token}`; // Aqui verificar se encontrou o token se encontrou 
                // Cola no cabeçalho do pedido
                console.log('[API REQUEST] Adding Authorization header with token length:', token.length);
            } else {
                console.log('[API REQUEST] No token found');
            }
        } catch (error) { // Se deu ruim na hora de buscar o token Mostre um erro
            console.log('Erro ao recuperar token: ', error)
        }

        // IMPORTANTE: Se é FormData, NÃO definir Content-Type manualmente
        // Deixa o axios/XHR gerar multipart/form-data com boundary correto
        const isFormData = config.data && (
            config.data instanceof FormData ||
            (typeof FormData !== 'undefined' && config.data.constructor.name === 'FormData') ||
            config.data._parts // React Native FormData tem _parts
        );

                if (isFormData) {
                        console.log('[API REQUEST] FormData detectado - removendo Content-Type para deixar axios gerar');
                        // Remove Content-Type se foi definido (axios gerará automaticamente)
                        if (config.headers && config.headers['Content-Type']) {
                                delete config.headers['Content-Type'];
                        }
                        if (config.headers && config.headers['content-type']) {
                                delete config.headers['content-type'];
                        }
                        // Remover dos defaults também (garantia extra)
                        if (axios.defaults.headers) {
                            if (axios.defaults.headers.post && axios.defaults.headers.post['Content-Type'] === 'application/x-www-form-urlencoded') {
                                delete axios.defaults.headers.post['Content-Type'];
                            }
                            if (axios.defaults.headers.put && axios.defaults.headers.put['Content-Type'] === 'application/x-www-form-urlencoded') {
                                delete axios.defaults.headers.put['Content-Type'];
                            }
                            if (axios.defaults.headers.common && axios.defaults.headers.common['Content-Type'] === 'application/x-www-form-urlencoded') {
                                delete axios.defaults.headers.common['Content-Type'];
                            }
                        }
                }

        console.log('[API REQUEST] URL:', config.url, 'Method:', config.method);
        console.log('[API REQUEST] Headers:', JSON.stringify(config.headers, null, 2));
        console.log('[API REQUEST] Data type:', config.data?.constructor?.name || typeof config.data);
        
        return config; // Aqui ele devolve o pedido se existir pra manda pro servidor(Back-end)
    },
    (error) => Promise.reject(error) // Se deu algun erro antes de mandar ele ja rejeita na hora 
)



// Flag para evitar múltiplos alerts simultâneos
let sessionAlertVisible = false;

api.interceptors.response.use(
    res => res,
    async err => {
        if (err?.response) {
            const status = err.response.status;
            const data = err.response.data;
            let msg = 'Erro inesperado. Tente novamente mais tarde.';
            if (data && (data.message || data.error)) {
                msg = data.message || data.error;
            }
            if (status === 500) {
                msg = 'Erro interno do servidor. Tente novamente mais tarde.';
            } else if (status === 400) {
                msg = data?.message || 'Requisição inválida.';
            }

            // Tratar 401 e 403 como expiração de sessão
            if ((status === 401 || status === 403) && !sessionAlertVisible) {
                sessionAlertVisible = true;
                msg = 'Sua sessão expirou. Faça login novamente.';
                Alert.alert(
                    'Sessão expirada',
                    msg,
                    [
                        {
                            text: 'Ir para login',
                            onPress: async () => {
                                await AsyncStorage.removeItem('userToken');
                                await AsyncStorage.removeItem('userInfo');
                                sessionAlertVisible = false;
                                if (RootNavigation && RootNavigation.navigate) {
                                    RootNavigation.navigate('Login');
                                }
                            }
                        }
                    ],
                    { cancelable: false }
                );
            }
            err.userMessage = msg;
        } else {
            err.userMessage = 'Sem conexão com o servidor.';
        }
        return Promise.reject(err);
    }
)

export default api;