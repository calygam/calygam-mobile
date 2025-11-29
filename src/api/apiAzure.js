import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import * as RootNavigation from "../utils/RootNavigation";

// Instância separada para a API da Azure
const apiAzure = axios.create({
    baseURL: 'https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net'
});

// Interceptor de requisição (igual ao original, mas para esta instância)
apiAzure.interceptors.request.use(
    async(config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                if (!config.headers) {
                    config.headers = {};
                }
                config.headers.Authorization = `Bearer ${token}`;
                console.log('[API AZURE REQUEST] Adding Authorization header with token length:', token.length);
            } else {
                console.log('[API AZURE REQUEST] No token found');
            }
        } catch (error) {
            console.log('Erro ao recuperar token: ', error);
        }

        // Lidar com FormData
        const isFormData = config.data && (
            config.data instanceof FormData ||
            (typeof FormData !== 'undefined' && config.data.constructor.name === 'FormData') ||
            config.data._parts
        );

        if (isFormData) {
            console.log('[API AZURE REQUEST] FormData detectado - removendo Content-Type');
            if (config.headers && config.headers['Content-Type']) {
                delete config.headers['Content-Type'];
            }
            if (config.headers && config.headers['content-type']) {
                delete config.headers['content-type'];
            }
        }

        console.log('[API AZURE REQUEST] URL:', config.url, 'Method:', config.method);
        console.log('[API AZURE REQUEST] Headers:', JSON.stringify(config.headers, null, 2));
        console.log('[API AZURE REQUEST] Data type:', config.data?.constructor?.name || typeof config.data);
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de resposta (igual ao original)
let sessionAlertVisibleAzure = false;

apiAzure.interceptors.response.use(
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

            if ((status === 401 || status === 403) && !sessionAlertVisibleAzure) {
                sessionAlertVisibleAzure = true;
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
                                sessionAlertVisibleAzure = false;
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
);

export default apiAzure;