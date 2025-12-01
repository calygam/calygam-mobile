import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import SearchBar from '../../components/SeachBiblioteca/Seach'
import CardsTrilhas from '../../components/CardTrilhas/CardsTrilhas'
import Modal from '../../components/BottomSheetModalPerfil/Modalperfil'
import CardProcessoTrilha from '../../components/CardProcesso/CardProcessoTrilha'
import { FlatList } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Carrossel from '../../components/Carrossel';
import LoadingSkeletonShimmer from '../../components/LoadingSkeletonShimmer';
import useTrilhaApi from '../../hooks/useTrilhaApi';
import { validateAndFilterTrails } from '../../utils/trailValidation';

export default function BibliotecaCursos() {
    const navigation = useNavigation();
    const [trails, setTrails] = useState([]);
    const [inProgressTrails, setInProgressTrails] = useState([]); // [{trailId, trailName, progress}]
    const [loading, setLoading] = useState(true);
    const { width } = Dimensions.get('window');
    const { handleEnterInTrailMobile } = useTrilhaApi();
    const [search, setSearch] = useState("");

    // Isso cria uma lista já filtrada
    const filteredTrails = trails.filter(trail =>
        trail.trailName.toLowerCase().includes(search.toLowerCase())
    );

    // Lista de Trilhas com Filtro
    useEffect(() => {
        const fetchTrails = async () => {
            setLoading(true);
            try {
                
                const token = await AsyncStorage.getItem("userToken");
                console.log("TOKEN NO MOMENTO DA CHAMADA:", token);
                // const response = await axios.get('https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/trail/read/all-trails'
                const response = await api.get("trail/read/all-trails", {
                    params: {
                        // haveProgress: "HAVE_PROGRESS", // Exemplo de filtro por progresso
                        haveProgress: "NOT_HAVE_PROGRESS"

                    },
                });
                const data = Array.isArray(response.data) ? response.data : [];
                // Filtra para mostrar apenas trilhas ATIVAS (ENABLE)
                const onlyEnabled = data.filter(t => {
                    const raw = String(t.trailStatus || "").toUpperCase().trim();
                    return raw === "ENABLE";
                });
                setTrails(onlyEnabled);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar as trilhas.');
                console.error('Erro ao buscar trilhas:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTrails();
    }, []);

    // Carrega trilhas em progresso do usuário atual
    const loadInProgress = useCallback(async (forceReload = false) => {
        console.log('[BibliotecaCursos] 🔄 Carregando trilhas em progresso...');
        try {
            const rawUser = await AsyncStorage.getItem('userInfo');
            const parsedUser = rawUser ? JSON.parse(rawUser) : null;
            const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';
            const listKey = `joinedTrails:${uid}`;
            const rawList = await AsyncStorage.getItem(listKey);
            const list = rawList ? JSON.parse(rawList) : [];
            
            console.log(`[BibliotecaCursos] 📋 Total de trilhas no cache: ${list.length}`);
            
            // 🛡️ VALIDAÇÃO: Usa função utilitária para validar e filtrar trilhas
            const { validTrails, removedCount } = await validateAndFilterTrails(list, uid);
            
            if (removedCount > 0) {
                console.log(`[BibliotecaCursos] 🧹 Cache atualizado: ${removedCount} trilhas removidas`);
            }
            console.log(`[BibliotecaCursos] 📊 Trilhas válidas restantes: ${validTrails.length}`);
            
            // Para cada trilha válida, buscar progresso
            const withProgress = await Promise.all(
                validTrails.map(async (t) => {
                    try {
                        const pRaw = await AsyncStorage.getItem(`trailProgress:${uid}:${t.trailId}`);
                        const p = pRaw ? Number(pRaw) : 0;
                        return { ...t, progress: isNaN(p) ? 0 : p };
                    } catch (error) {
                        console.warn(`[BibliotecaCursos] Erro ao buscar progresso para trilha ${t.trailId}:`, error);
                        return { ...t, progress: 0 };
                    }
                })
            );
            
            console.log(`[BibliotecaCursos] 🎯 Exibindo ${withProgress.length} trilhas em progresso`);
            setInProgressTrails(withProgress);
        } catch (e) {
            console.error('[BibliotecaCursos] 💥 Erro ao carregar trilhas em progresso:', e);
            setInProgressTrails([]);
        }
    }, []);

    // Sempre que a tela ganhar foco, recarrega
    useFocusEffect(
        useCallback(() => {
            loadInProgress();
        }, [loadInProgress])
    );
    

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#021713' }} >
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#021713', paddingTop: 100 }}>
                    <LoadingSkeletonShimmer type="list" count={5} />
                </View>
            ) : (
                <View style={styles.container}>

                    {/* Header */}
                    <View style={styles.containerHeader}>
                        <View style={styles.searchBar}>
                            <Modal />
                            <SearchBar value={search} onChangeText={setSearch} />
                        </View>
                    </View>

                    {inProgressTrails.length > 0 && (
                        <View style={styles.CardProcessoTrilha}>
                            {/* Card de progresso da trilha que o usuario está participando */}
                            <View style={styles.TextTrilhas}>
                                <Text style={{ color: '#FFF', fontSize: 24, textAlign: 'left' }}> Trilhas em Procresso</Text>
                            </View>
                            {/* Carrossel Horizontal */}
                            <Carrossel
                                data={inProgressTrails}
                                keyExtractor={(t) => String(t.trailId)}
                                renderItem={({ item: t }) => (
                                    // Você só se preocupa em RENDERIZAR o card.
                                    // O Carrossel.js cuida do tamanho e da margem.
                                    <CardProcessoTrilha
                                        title={t.trailName}
                                        progress={t.progress ?? 0}
                                        trailImage={t.trailImage || null}
                                        iconKey={t.icon || t.trailIcon || t.iconName || null}
                                        iconSource={t.iconUri ? { uri: t.iconUri } : null}
                                        trailId={t.trailId}
                                        onContinue={() => navigation.navigate('Trilha', { trailId: t.trailId, trailName: t.trailName })}
                                        onTrailDeleted={() => loadInProgress(true)}
                                    />
                                )}
                            />
                        </View>
                    )}
                    

                    {/* Texto - Trilhas Disponiveis */}
                    <View style={styles.TextTrilhas}>
                        <Text style={{ color: '#FFF', fontSize: 24, textAlign: 'left' }}> Trilhas Disponíveis </Text>
                        <Text style={{ color: '#D9D9D9', fontSize: 15, textAlign: 'left', fontWeight: '100' }}> Explore novas áreas do conhecimento </Text>
                    </View>

                    <FlatList
                         data={filteredTrails}
                        renderItem={({ item }) => {

                            // dentro do render do FlatList (no CardsTrilhas)
                            const onEnterTrail = async (trailId, trailPassword) => {
                                try {
                                    // feedback UI opcional
                                    await handleEnterInTrailMobile(trailId, trailPassword);
                                    // depois que join OK, navega pra tela da trilha
                                    navigation.navigate('Trilha', { trailId, trailName: item.trailName });
                                } catch (err) {
                                    console.log("Erro ao entrar na trilha:", err?.response?.data || err);
                                    Alert.alert('Erro', typeof err?.response?.data === 'string' ? err.response.data : 'Não foi possível entrar na trilha.');
                                }
                            };


                            // Normaliza os dados do professor vindos do backend
                            const professor = item.user || item.professor || item.teacher || {};
                            const professorName = professor?.userName ?? professor?.name ?? professor?.displayName ?? 'Desconhecido';
                            const professorPhotoUrl =
                                professor?.photoUrl ||
                                professor?.photoURL ||
                                professor?.avatarUrl ||
                                professor?.avatar ||
                                professor?.profileImageUrl ||
                                professor?.imageUrl ||
                                professor?.picture ||
                                null;

                            return (
                                <CardsTrilhas
                                    item={item}
                                    professorName={professorName}
                                    professorPhotoUrl={professorPhotoUrl}
                                    onEnter={() => onEnterTrail(item.trailId, item.trailPassword)}
                                    onRefresh={() => {
                                        loadInProgress(true);
                                        // Recarrega trilhas disponíveis
                                        const fetchTrails = async () => {
                                            try {
                                                const response = await api.get("trail/read/all-trails", {
                                                    params: {
                                                        haveProgress: "NOT_HAVE_PROGRESS"
                                                    },
                                                });
                                                const data = Array.isArray(response.data) ? response.data : [];
                                                const onlyEnabled = data.filter(t => {
                                                    const raw = String(t.trailStatus || "").toUpperCase().trim();
                                                    return raw === "ENABLE";
                                                });
                                                setTrails(onlyEnabled);
                                            } catch (error) {
                                                console.error('Erro ao recarregar trilhas:', error);
                                            }
                                        };
                                        fetchTrails();
                                    }}
                                />
                            )
                        }}
                        keyExtractor={item => String(item.trailId || item.id || Math.random())}
                        contentContainerStyle={styles.flatListContainer}
                    />

                </View >
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#021713',
        paddingTop: 50,
        gap: 35,
        height: 'auto',
        flex: 1,
        paddingBottom: 80

    },
    containerHeader: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        width: 'auto',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 18,
        zIndex: 2,
    },
    perfil: {
        height: 50,
        width: 50,
        backgroundColor: 'red',
        borderRadius: 100
    },
    TextTrilhas: {
        width: '95%',
        height: 50,
        justifyContent: 'center',
        gap: 8
    },
    flatListContainer: {
        flexGrow: 1,
        backgroundColor: '#021713',
        alignItems: 'center',
        gap: 25,
        height: 'auto',
        flex: 1,
        paddingTop: 30,
        marginBottom: 30

    },
    CardProcessoTrilha: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 12,
    }
})