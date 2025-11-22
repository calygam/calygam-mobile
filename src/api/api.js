import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
    baseURL: "http://10.0.0.191:8080",
    // baseURL: 'https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net'
    timeout: 30000,  // Aumentado para 30s
})

api.interceptors.request.use(
    async(config) => {
        try { // O try Tenta pegar o token
            const token = await AsyncStorage.getItem('userToken') // Procurar no celular se existe um token salvo
            if (token) {
                config.headers.Authorization = `Bearer ${token}`; // Aqui verificar se encontrou o token se encontrou 
                // Cola no cabeçalho do pedido
                console.log('[API REQUEST] Adding Authorization header with token length:', token.length);
            } else {
                console.log('[API REQUEST] No token found');
            }
        } catch (error) { // Se deu ruim na hora de buscar o token Mostre um erro
            console.log('Erro ao recuperar token: ', error)
        }
        console.log('[API REQUEST] URL:', config.url, 'Method:', config.method, 'Headers:', config.headers);
        return config; // Aqui ele devolve o pedido se existir pra manda pro servidor(Back-end)
    },
    (error) => Promise.reject(error) // Se deu algun erro antes de mandar ele ja rejeita na hora 
)

api.interceptors.response.use(
    res => res,
    err => {
        if (err?.response?.status === 403) {
            // opcional: limpar token, enviar evento de logout
            // AsyncStorage.removeItem('userToken');
        }
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
            } else if (status === 403) {
                msg = 'Acesso negado. Faça login novamente.';
            }
            // Adicionar msg ao erro para uso posterior
            err.userMessage = msg;
        } else {
            err.userMessage = 'Sem conexão com o servidor.';
        }
        return Promise.reject(err);
    }
)

export default api;