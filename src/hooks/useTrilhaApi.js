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

export const useTrilhaApi = () => {
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
                    // Fallback: tentar decodificar manualmente
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
            console.log('Trilhas criadas (raw):', resp.data);   // DEBUG
            setCreatedTrails(resp.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar suas trilhas criadas.');
            console.warn('Erro ao buscar trilhas do professor:', error);
        }
    };

    // Função De criação de trilha
    const criarTrilha = async (formData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            const response = await api.post('/trail/create', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Sucesso', 'Trilha criada com sucesso!');
            fetchCreatedTrails(userId);
            return response.data;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar a trilha. Tente novamente mais tarde.');
            console.error(error);
        }
    };

    // Função De atualização de trilha
    const updateTrilha = async (trailId, formData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            const response = await api.put(`/trail/update/${trailId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Sucesso', 'Trilha atualizada com sucesso!');
            fetchCreatedTrails(userId);
            return response.data;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a trilha. Tente novamente.');
            console.error(error);
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
            // backend só altera para ENABLE se calygamCode == "calygam up trail"
            const response = await api.put(`/trail/update/${trailId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Sucesso', 'Trilha publicada!');
            fetchCreatedTrails(userId);
            return response.data;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível publicar a trilha.');
            console.error(error);
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