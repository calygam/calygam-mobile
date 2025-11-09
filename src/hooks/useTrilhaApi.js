import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';

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
                    const decoded = jwtDecode(token);
                    setUserId(decoded.userId);
                } catch (error) {
                    console.error('Erro ao decodificar token:', error);
                }
            }
        };
        loadUserId();
    }, []);

    // Função de busca de trilhas criadas pelo professor
    const fetchCreatedTrails = async (uid) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const resp = await axios.get('http://10.0.0.191:8080/trail/read/all-trails', {
                params: {
                    user: uid,
                    status: 'ativa',
                    haveProgress: "NOT_HAVE_PROGRESS"
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            const all = resp.data || [];
            const mine = all.filter(item => Number(item.user) === Number(uid));
            setCreatedTrails(mine);
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

            const response = await axios.post('http://10.0.0.191:8080/trail/create', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Sucesso', 'Trilha criada com sucesso!');
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

            const response = await axios.put(`http://10.0.0.191:8080/trail/update/${trailId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Sucesso', 'Trilha atualizada com sucesso!');
            return response.data;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a trilha. Tente novamente.');
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

            await axios.delete(`http://10.0.0.191:8080/trail/delete/${trailId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            Alert.alert('Sucesso', 'Trilha deletada com sucesso!');
            fetchCreatedTrails(userId);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível deletar a trilha. Tente novamente.');
            console.error(error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCreatedTrails(userId);
        }
    }, [userId]);

    return {
        userToken,
        userId,
        createdTrails,
        fetchCreatedTrails,
        criarTrilha,
        updateTrilha,
        deleteTrilha,
    };
};