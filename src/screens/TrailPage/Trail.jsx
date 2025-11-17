import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import Modal from '../../components/BottomSheetModalPerfil/Modalperfil'
import IconCoins from '../../../assets/svg/IconsInterface/coin.svg';
import IconAviso from '../../../assets/svg/undraw_access-denied_krem.svg';
import api from '../../api/api';
import { Image } from 'react-native';

export default function Trail() {

    const route = useRoute();
    const navigation = useNavigation();
    const { trailId, trailName } = route.params || {};  // <- params da trilha selecionada
    const [userName, setUserName] = useState();
    const [trail, setTrail] = useState();
    const [completedIndex, setCompletedIndex] = useState(-1);

    useEffect(() => {
        const loadUser = async () => {
            const data = await AsyncStorage.getItem("userInfo");
            if (data) {
                setUserName(JSON.parse(data));
            }
        };

        loadUser();
    }, []);


    useEffect(() => {
        const loadTrail = async () => {
            try {
                if (trailId) {
                    const token = await AsyncStorage.getItem('userToken');
                    const response = await api.get(`/trail/read/${trailId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const fullTrail = response.data;
                    setTrail(fullTrail);
                    try {
                        const rawUser = await AsyncStorage.getItem('userInfo');
                        const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                        const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';
                        await AsyncStorage.setItem(`currentTrail:${uid}`, JSON.stringify(fullTrail));
                    } catch (err) {}
                    return;
                }

                // Sem params: tenta carregar última trilha usada
                try {
                    const rawUser = await AsyncStorage.getItem('userInfo');
                    const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                    const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';
                    const stored = await AsyncStorage.getItem(`currentTrail:${uid}`);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        setTrail(parsed);
                    }
                } catch (err) {}
            } catch (e) {
                console.log('Erro ao carregar trilha:', e?.response?.data || e.message);
            }
        };
        loadTrail();
    }, [trailId]);
    
    // Carrega índice de atividade concluída para liberar próxima
    useEffect(() => {
        const loadCompleted = async () => {
            try {
                if (!trailId) return;
                const rawUser = await AsyncStorage.getItem('userInfo');
                const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';
                const key = `completedActivities:${uid}:${trailId}`;
                const val = await AsyncStorage.getItem(key);
                setCompletedIndex(val != null ? Number(val) : -1);
            } catch (err) {}
        };
        loadCompleted();
    }, [trailId]);


    if (!trail) {
        return (
            <View style={styles.loading}>
                <IconAviso width={180} height={180} />
                <Text style={{ color: '#ffffffff', justifyContent: 'center', alignItems: 'center' }}>Ops! Algo deu errado....</Text>
                <Text style={{ color: '#ffffffff', justifyContent: 'center', alignItems: 'center' }}>Confirme se você está em uma trilha!</Text>
            </View>
        );
    }
    // cálculo simples de progresso (exemplo)
    const maxXP = 100;

    const progress = userName && typeof userName.xp === 'number' ? (userName.xp / maxXP) : 0;

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {/* Os Textos de Boa Vindo e tal */}
                <View style={styles.InfoContent}>
                    <Modal />
                    <View style={{
                        alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 1
                    }}>
                        <Text style={styles.title}>Olá, {userName?.displayName}! - {trailName}</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, }}> Continue de onde parou.</Text>
                    </View>
                </View>

                {/* Painel de Recompensas */}
                <View style={styles.PainelContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 11 }}>
                        <Text style={styles.title}>Painel de Recompensas</Text>
                        <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }}>
                            <IconCoins width={20} height={20} />
                            <Text style={{ color: '#FFFFFF', fontSize: 14, }}>Coins: {userName?.money ?? 0}</Text>
                        </View>
                    </View>

                    <View style={{ paddingLeft: 5, paddingRight: 5, justifyContent: 'space-between' }}>
                        <View style={styles.rewardItem}>

                            <View style={styles.rankContainer}>
                                <Text style={{ color: '#FFFFFF', fontSize: 14 }}> Rank: {userName?.rank}</Text>
                            </View>

                            <View style={styles.rankContainer}>
                                <Text style={{ color: '#FFFFFF', fontSize: 14, }}>xp: {userName?.xp ?? 0} / {maxXP}</Text>
                                <View style={styles.progressBarBackground}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { width: `${progress * 100}%` }
                                        ]}
                                    />
                                </View>
                            </View>

                        </View>
                    </View>


                </View>


                {/* Status e recompensar da atividade */}
                <View style={styles.StatusContainer}>
                    <View style={styles.Status}>
                        <Text style={{ color: '#05ff5cff' }}>Facil</Text>
                    </View>

                    <View style={styles.Recompensa}>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, }}>Recompensar - Atividade</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, }}>825 XP</Text>
                    </View>
                </View>

                {/* Bolinhas de atividades em formato S */}
                <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 15 }}>
                    {trail.activities?.map((activity, index) => {

                        // alternar posição das bolinhas para formar o S
                        const positionStyle =
                            index % 2 === 0
                                ? { alignSelf: "flex-start" }
                                : { alignSelf: "flex-end" };

                        const unlocked = index <= (completedIndex + 1);

                        const handlePress = () => {
                            if (!unlocked) {
                                Alert.alert('Bloqueado', 'Complete as atividades anteriores para desbloquear esta.');
                                return;
                            }
                            navigation.navigate('Atividade', {
                                activityId: activity.activityId,
                                activityName: activity.activityName,
                                activityDescription: activity.activityDescription,
                                activityPrice: activity.activityPrice,
                                activityDifficulty: activity.activityDifficulty,
                                trailId,
                                trailName,
                                index
                            });
                        };

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={handlePress}
                                activeOpacity={0.8}
                                style={[
                                    {
                                        marginVertical: 25,
                                        alignItems: "center"
                                    },
                                    positionStyle
                                ]}
                            >
                                {/* Bolinha */}
                                <View
                                    style={[
                                        {
                                            width: 70,
                                            height: 70,
                                            borderRadius: 35,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            shadowColor: "#000",
                                            shadowOpacity: 0.3,
                                            shadowRadius: 4,
                                        },
                                        unlocked ? { backgroundColor: "#6C63FF" } : { backgroundColor: "#DDD" }
                                    ]}
                                >
                                    {!unlocked && (
                                        <Text style={{ color: "#666", fontSize: 18 }}>🔒</Text>
                                    )}
                                    {unlocked && (
                                        <Text style={{ color: '#FFF', fontSize: 16 }}>{index + 1}</Text>
                                    )}
                                </View>
                                {/* Nome da atividade */}
                                <Text style={{ color: "#FFF", marginTop: 8, fontSize: 13 }}>
                                    {activity.activityName}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>


            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#021713',
        gap: 25,
        paddingTop: 50,
        paddingBottom: 80

    },
    InfoContent: {
        width: '95%',
        height: 'auto',
        backgroundColor: '#1E3D35',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 15,

    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 1,

    },
    PainelContent: {
        width: '95%',
        height: 'auto',
        backgroundColor: '#1E3D35',
        borderRadius: 20,
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 10,
    },
    progressBarBackground: {
        width: '95%',
        height: 12,
        backgroundColor: '#f8f8f8ff',
        borderRadius: 8,
        marginTop: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6C63FF',
    },
    rankContainer: {
        marginBottom: 8,
        borderRadius: 12,
        padding: 8,
        borderColor: '#ffffffff',
        borderWidth: 2,
        gap: 4,
        alignItems: 'center',
        height: 65,
        justifyContent: 'center',
    },
    rewardItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        width: 'auto',
        height: 'auto',


    },
    Status: {
        width: 'auto',
        height: 40,
        paddingHorizontal: 15,
        borderRadius: 40,
        backgroundColor: '#79f61266',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    StatusContainer: {
        width: '90%',
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    Recompensa: {
        width: 'auto',
        height: 40,
        paddingHorizontal: 18,
        borderRadius: 40,
        backgroundColor: '#6C63FF',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#021713',
        gap: 10,
    },
    CardProgress: {
        width: '75%',
        height:  190,
        backgroundColor: 'rgba(90, 24, 154, 0.4)',
        borderWidth: 2,
        borderColor: '#5A189A',
        borderRadius: 20,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    FotoIconTrilha: {
        backgroundColor: '#cd82ff3f',
        height: 45,
        width: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
})