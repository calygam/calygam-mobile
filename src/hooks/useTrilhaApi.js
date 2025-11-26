import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import * as jwtDecode from 'jwt-decode';
import api from '../api/api';

// Função para decodificar JWT manualmente (fallback)
const decodeJWT = (token) => {
    try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decodedPayload;
    } catch (error) {
        console.error('Erro ao decodificar JWT manualmente:', error);
        return null;
    }
};

const useTrilhaApi = () => {
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [createdTrails, setCreatedTrails] = useState([]);

    useEffect(() => {
        const loadUserId = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
            if (token) {
                try {
                    let decoded;
                    if (jwtDecode && jwtDecode.default) {
                        decoded = jwtDecode.default(token);
                    } else {
                        decoded = decodeJWT(token);
                    }
                    setUserId(decoded?.userId || decoded?.sub);
                } catch (error) {
                    console.error('Erro ao decodificar token:', error);
                    
                    try {
                        const decoded = decodeJWT(token);
                        setUserId(decoded?.userId || decoded?.sub);
                    } catch (fallbackError) {
                        console.error('Erro no fallback de decodificação:', fallbackError);
                    }
                }
            }
        };
        loadUserId();
    }, []);

    // Função de busca de trilhas criadas pelo professor
    const fetchCreatedTrails = async (uid) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const resp = await api.get('/trail/read/by/teacher', {

            });
            console.log('Trilhas criadas (raw):', resp.data);
            setCreatedTrails(resp.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar suas trilhas criadas.');
            console.warn('Erro ao buscar trilhas do professor:', error);
        }
    };

    // Função De criação de trilha
    // Usa fetch diretamente para evitar problemas com FormData no axios no React Native
    const criarTrilha = async (formData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            // Monta URL completa usando baseURL do api
            const baseURL = api.defaults?.baseURL || 'http://10.0.0.191:8080';
            const url = `${baseURL}/trail/create`;

            console.log('[CRIAR] Enviando via fetch para:', url);

            // Usa fetch diretamente (padrão usado em outros uploads do projeto)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NÃO definir Content-Type - fetch gera automaticamente com boundary correto
                },
                body: formData
            });

            console.log('[CRIAR] Fetch status:', response.status);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Erro desconhecido');
                console.error('[CRIAR] Erro HTTP:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('[CRIAR] Trilha criada com sucesso:', data);
            Alert.alert('Sucesso', 'Trilha criada com sucesso!');
            fetchCreatedTrails(userId);
            return data;
        } catch (error) {
            console.log('ERRO CRIAR TRILHA:', {
                message: error?.message,
                name: error?.name,
            });
            console.log('ERRO raw:', error);
            Alert.alert('Erro', 'Não foi possível criar a trilha. Tente novamente mais tarde.');
            return null;
        }
    };

    // Função De atualização de trilha
    // Usa fetch diretamente para evitar problemas com FormData no axios no React Native
    const updateTrilha = async (trailId, formData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            // Monta URL completa usando baseURL do api
            const baseURL = api.defaults?.baseURL || 'http://10.0.0.191:8080';
            const url = `${baseURL}/trail/update/${trailId}`;

            console.log('[UPDATE] Enviando via fetch para:', url);

            // Usa fetch diretamente (padrão usado em outros uploads do projeto)
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NÃO definir Content-Type - fetch gera automaticamente com boundary correto
                },
                body: formData
            });

            console.log('[UPDATE] Fetch status:', response.status);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Erro desconhecido');
                console.error('[UPDATE] Erro HTTP:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('[UPDATE] Trilha atualizada com sucesso:', data);
            Alert.alert('Sucesso', 'Trilha atualizada com sucesso!');
            fetchCreatedTrails(userId);
            return data;
        } catch (error) {
            console.log('ERRO UPDATE TRILHA:', {
                message: error?.message,
                name: error?.name,
            });
            console.error('ERRO raw:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a trilha. Tente novamente.');
            return null;
        }
    };

    // Publicar trilha (apenas mudar status via calygamCode)
    const publishTrilha = async (trailId, calygamCode) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token inválido. Faça login novamente.');
                return;
            }
            const formData = new FormData();
            formData.append('calygamCode', calygamCode);
            
            // Monta URL completa usando baseURL do api
            const baseURL = api.defaults?.baseURL || 'http://10.0.0.191:8080';
            const url = `${baseURL}/trail/update/${trailId}`;

            // backend só altera para ENABLE se calygamCode == "calygam up trail"
            // Usa fetch diretamente para FormData
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Erro desconhecido');
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            Alert.alert('Sucesso', 'Trilha publicada!');
            fetchCreatedTrails(userId);
            return data;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível publicar a trilha.');
            console.error(error);
            return null;
        }
    };

    // Função de deletar uma trilha
    const deleteTrilha = async (trailId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            await api.delete(`/trail/delete/${trailId}`, {
            });
            Alert.alert('Sucesso', 'Trilha deletada com sucesso!');
            fetchCreatedTrails(userId);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível deletar a trilha. Tente novamente.');
            console.error(error);
        }
    };

    // Função para Criar um Progresso quando o usuario entrar em uma trilha
    // dentro do hook useTrilhaApi
    const handleEnterInTrailMobile = async (trailId, password) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) throw new Error('Token ausente. Faça login novamente.');
            const query = password && password.length > 0 ? `?trailPassword=${encodeURIComponent(password)}` : "";

            const resp = await api.post(`/progress/join/${trailId}${query}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('JOIN resp', resp.status, resp.data);
            if (![200, 201].includes(resp.status) || !Array.isArray(resp.data) || resp.data.length === 0) {
                throw new Error('Falha ao iniciar progresso da trilha (join não criou progress).');
            }

            // Salva lista de progress (útil para confirmar atividades)
            const rawUser = await AsyncStorage.getItem('userInfo');
            const parsed = rawUser ? JSON.parse(rawUser) : null;
            const uid = parsed?.uid || parsed?.userId || parsed?.id || parsed?.email || 'anon';
            await AsyncStorage.setItem(`progressList:${uid}:${trailId}`, JSON.stringify(resp.data));

            // salva joinedTrails: se já tiver adiciona, senão cria
            const joinedKey = `joinedTrails:${uid}`;
            const rawJoined = await AsyncStorage.getItem(joinedKey);
            const joinedArr = rawJoined ? JSON.parse(rawJoined) : [];

            // cria um objeto minimal da trilha para o carrossel / lista
            const newTrailInfo = {
                trailId,
                trailName: resp.data && resp.data.length ? resp.data[0].trailName ?? `Trilha ${trailId}` : `Trilha ${trailId}`,
                // se quiser adicionar outros campos
            };

            // evita duplicata
            const exists = joinedArr.some(j => j.trailId === trailId);
            const newJoined = exists ? joinedArr : [...joinedArr, newTrailInfo];
            await AsyncStorage.setItem(joinedKey, JSON.stringify(newJoined));

            // cria progresso local default (0) se não existir
            const progressKey = `trailProgress:${uid}:${trailId}`;
            const existingProgress = await AsyncStorage.getItem(progressKey);
            if (existingProgress == null) {
                await AsyncStorage.setItem(progressKey, "0");
            }

            console.log("JOIN ok no mobile", resp.data);
            return resp.data; // devolve ao caller se precisar
        } catch (e) {
            console.log("Erro JOIN mobile:", e?.response?.data || e);
            throw e;
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCreatedTrails();
        }
    }, [userId]);

    return {
        userToken,
        userId,
        createdTrails,
        fetchCreatedTrails,
        criarTrilha,
        updateTrilha,
        publishTrilha,
        deleteTrilha,
        handleEnterInTrailMobile
    };
};

export default useTrilhaApi;