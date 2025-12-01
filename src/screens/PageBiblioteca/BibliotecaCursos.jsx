import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import SearchBar from '../../components/SeachBiblioteca/Seach'
import CardsTrilhas from '../../components/CardTrilhas/CardsTrilhas'
import Modal from '../../components/BottomSheetModalPerfil/Modalperfil'
import CardProcessoTrilha from '../../components/CardProcesso/CardProcessoTrilha'
import { FlatList } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Carrossel from '../../components/Carrossel';
import LoadingSkeletonShimmer from '../../components/LoadingSkeletonShimmer';
import useTrilhaApi from '../../hooks/useTrilhaApi';

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
    
    // 🐛 DEBUG: Log para rastrear o que está chegando no FlatList
    console.log(`[BibliotecaCursos] 🎯 trails.length=${trails.length}, search="${search}", filteredTrails.length=${filteredTrails.length}`);

    // Função para buscar trilhas disponíveis E em progresso em paralelo
    const fetchTrails = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            console.log("[BibliotecaCursos] 🔄 Buscando trilhas (HAVE_PROGRESS e NOT_HAVE_PROGRESS)...");
            
            // Faz DUAS requisições em paralelo para obter ambos os conjuntos
            const [haveProgressResponse, notHaveProgressResponse] = await Promise.all([
                // Trilhas em progresso (HAVE_PROGRESS)
                api.get("trail/read/all-trails", {
                    params: { haveProgress: "HAVE_PROGRESS" }
                }).catch(err => {
                    console.warn('[BibliotecaCursos] ⚠️ Erro ao buscar HAVE_PROGRESS:', err?.response?.status, err?.response?.data);
                    return { data: [] }; // Retorna array vazio em caso de erro
                }),
                
                // Trilhas disponíveis (NOT_HAVE_PROGRESS)
                api.get("trail/read/all-trails", {
                    params: { haveProgress: "NOT_HAVE_PROGRESS" }
                }).catch(err => {
                    console.warn('[BibliotecaCursos] ⚠️ Erro ao buscar NOT_HAVE_PROGRESS:', err?.response?.status, err?.response?.data);
                    return { data: [] }; // Retorna array vazio em caso de erro
                })
            ]);

            // Processa trilhas EM PROGRESSO (HAVE_PROGRESS)
            const haveProgressData = Array.isArray(haveProgressResponse.data) ? haveProgressResponse.data : [];
            console.log(`[BibliotecaCursos] 📊 Trilhas em progresso (HAVE_PROGRESS): ${haveProgressData.length}`);
            
            // Mapeia trilhas em progresso com dados do progressBarTrailDTO se disponível
            // Backend envia: progressBarTrailDTO { totalActivitiesCompleted, totalActivities }
            // Front calcula a porcentagem: (totalActivitiesCompleted / totalActivities) * 100
            const inProgressMapped = haveProgressData.map(t => {
                const progressBar = t.progressBarTrailDTO;
                
                // Calcula porcentagem a partir dos dados do backend
                let progressPercent = 0;
                if (progressBar && typeof progressBar.totalActivities === 'number' && progressBar.totalActivities > 0) {
                    const completed = progressBar.totalActivitiesCompleted || 0;
                    const total = progressBar.totalActivities;
                    progressPercent = Math.round((completed / total) * 100);
                }
                
                // Log para debug
                if (progressBar) {
                    console.log(`[BibliotecaCursos] 📈 Trilha ${t.trailId} (${t.trailName}): ${progressBar.totalActivitiesCompleted || 0}/${progressBar.totalActivities || 0} = ${progressPercent}%`);
                }
                
                return {
                    trailId: t.trailId,
                    trailName: t.trailName,
                    trailImage: t.trailImage,
                    trailIcon: t.trailIcon,
                    icon: t.trailIcon,
                    iconName: t.trailIcon,
                    progress: progressPercent,
                    progressBarTrailDTO: progressBar
                };
            });
            
            console.log(`[BibliotecaCursos] ✅ Trilhas em progresso processadas: ${inProgressMapped.length}`);
            setInProgressTrails(inProgressMapped);

            // Processa trilhas DISPONÍVEIS (NOT_HAVE_PROGRESS)
            const notHaveProgressData = Array.isArray(notHaveProgressResponse.data) ? notHaveProgressResponse.data : [];
            console.log(`[BibliotecaCursos] 📊 Trilhas disponíveis (NOT_HAVE_PROGRESS): ${notHaveProgressData.length}`);
            console.log(`[BibliotecaCursos] 📝 Status das trilhas disponíveis:`, notHaveProgressData.map(t => ({ 
                id: t.trailId, 
                name: t.trailName, 
                status: t.trailStatus, 
                type: typeof t.trailStatus 
            })));
            
            // Filtra para mostrar apenas trilhas ATIVAS (ENABLE)
            // Aceita status como número (0 = ENABLE) ou string ("ENABLE", "ATIVO", etc)
            const onlyEnabled = notHaveProgressData.filter(t => {
                const rawStatus = t.trailStatus ?? t.status ?? '';
                
                // Se for número: 0 = ENABLE
                if (typeof rawStatus === 'number') {
                    return rawStatus === 0;
                }
                
                // Se for string: aceita "ENABLE" ou "ATIVO"
                if (typeof rawStatus === 'string') {
                    const upper = rawStatus.toUpperCase().trim();
                    return upper === 'ENABLE' || upper === 'ATIVO';
                }
                
                return false;
            });
            
            console.log(`[BibliotecaCursos] ✅ Trilhas ativas filtradas (NOT_HAVE_PROGRESS): ${onlyEnabled.length}`);
            console.log(`[BibliotecaCursos] 🔍 Detalhes trilhas disponíveis:`, onlyEnabled.map(t => ({
                id: t.trailId,
                name: t.trailName,
                status: t.trailStatus,
                hasImage: !!t.trailImage,
                hasIcon: !!t.trailIcon,
                hasUser: !!t.user
            })));
            setTrails(onlyEnabled);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as trilhas.');
            console.error('[BibliotecaCursos] 💥 Erro ao buscar trilhas:', error);
            // Em caso de erro, define arrays vazios
            setTrails([]);
            setInProgressTrails([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Lista de Trilhas com Filtro - carrega na montagem
    useEffect(() => {
        fetchTrails();
    }, [fetchTrails]);

    // Sempre que a tela ganhar foco, recarrega trilhas disponíveis e em progresso
    useFocusEffect(
        useCallback(() => {
            console.log('[BibliotecaCursos] 🔄 Tela ganhou foco - recarregando trilhas...');
            fetchTrails();
        }, [fetchTrails])
    );
    

    // Header component para o FlatList
    const ListHeader = () => (
        <View style={styles.listHeaderContainer}>
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
                        <Text style={{ color: '#FFF', fontSize: 24, textAlign: 'left', width: '100%'}}> Trilhas em Procresso </Text>
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
                                onTrailDeleted={() => fetchTrails()}
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
        </View>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#021713', paddingTop: 100 }}>
                <LoadingSkeletonShimmer type="list" count={5} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#021713' }}>
            <FlatList
                data={filteredTrails}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={() => (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#FFF', fontSize: 16 }}>Nenhuma trilha disponível</Text>
                        <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>
                            Total: {trails.length} | Filtradas: {filteredTrails.length}
                        </Text>
                    </View>
                )}
                renderItem={({ item, index }) => {
                            console.log(`[BibliotecaCursos] 📦 Renderizando item ${index}:`, item?.trailName, item?.trailId);

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
                                        // Recarrega ambas as listas (disponíveis e em progresso)
                                        fetchTrails();
                                    }}
                                />
                            )
                        }}
                        keyExtractor={item => String(item.trailId || item.id || Math.random())}
                        contentContainerStyle={styles.flatListContainer}
                        nestedScrollEnabled={true}
                    />
        </View>
    )
}

const styles = StyleSheet.create({
    listHeaderContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: '#021713',
        paddingTop: 15,
        gap: 15,
    },
    containerHeader: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',

    },
    searchBar: {
        width: '90%',
        height: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 18,
        zIndex: 2,
    },
    perfil: {
        height: 50,
        width: 50,
        borderRadius: 100
    },
    TextTrilhas: {
        width: '100%',
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'flex-start',  
        gap: 4,
        paddingLeft: 20,
    },
    flatListContainer: {
        backgroundColor: '#021713',
        alignItems: 'center',
        gap: 25,
        paddingTop: 20,
        paddingBottom: 100,
        paddingHorizontal: 0,
    },
    CardProcessoTrilha: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 12,
    },
})