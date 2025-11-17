import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import { iconMap } from '../IconsModal/Icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import IconPessoas from "../../../assets/svg/IconsInterface/users-alt 2.svg";
import IconSeta from "../../../assets/svg/IconsCardExplorar/angulo-direito1.svg";
import TrailPasswordModal from '../TrailPasswordModal/TrailPasswordModal';

const { width, height } = Dimensions.get('window')

export default function CardsTrilhas({ item, professorName, professorPhotoUrl }) {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);

    const trailName = item?.trailName ?? 'Sem nome'
    const vacancies = item?.vacancies ?? item?.vacanciesTrail ?? item?.vagas ?? 'N/A'

    // Escolha de mídia: prioridade para ÍCONE; senão imagem; senão placeholder estilizado
    const renderTrailVisual = () => {
        const iconNameRaw = item?.trailIcon || item?.icon || null;

        // ✅ Se backend não enviou o ícone → cai no fallback
        if (!iconNameRaw) {
            console.log("Nenhum ícone recebido, usando fallback visual.");
            return (
                <View style={[styles.FotoIconTrilha, { backgroundColor: '#fffffff3' }]}>
                    {/* <Text style={{ color: '#CE82FF', fontSize: 12 }}>Trilha</Text> */}
                    <Image source={require('../../../assets/image/ImagemSem.png')} style={{ width: 28, height: 28 }} />
                </View>
            );
        }

        const key = iconNameRaw.toString().toLowerCase().replace(/[^a-z0-9]/g, '');

        const IconComponent = iconMap[key];

        if (IconComponent) {
            return (
                <View style={styles.FotoIconTrilha}>
                    <IconComponent width={28} height={28} fill="#FFF" />
                </View>
            );
        }

        return (
            <View style={[styles.FotoIconTrilha, { backgroundColor: '#5217b1ff' }]}>
                <Text style={{ color: '#CE82FF', fontSize: 12 }}>Trilha</Text>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <View style={styles.BoxCard}>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                    <View style={styles.FotoTrilha}>
                        {renderTrailVisual()}
                    </View>

                    <Text style={styles.title}>{trailName}</Text>

                </View>

                {/* Informações do Professor */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image
                        source={professorPhotoUrl ? { uri: professorPhotoUrl } : require('../../../assets/image/ImagemSem.png')}
                        style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#333' }}
                    />
                    <Text style={{ color: '#B3B3B3' }}>Prof. {professorName ?? 'Desconhecido'}</Text>
                </View>

                <View style={styles.Infomações}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <IconPessoas width={15} height={24} fill="#CE82FF" />
                        <Text style={{ color: '#CE82FF', fontSize: 13 }}> Vagas Disponiveis: {vacancies}</Text>
                    </View>


                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                        onPress={async () => {
                            // Verifica se a trilha já foi desbloqueada neste dispositivo
                            try {
                                const rawUser = await AsyncStorage.getItem('userInfo');
                                const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                                const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';

                                const unlockedKey = `trailUnlocked:${uid}:${item?.trailId}`;
                                const unlocked = await AsyncStorage.getItem(unlockedKey);
                                if (unlocked === 'true') {
                                    // Mantém a trilha atual salva (por usuário)
                                    try {
                                        await AsyncStorage.setItem(`currentTrail:${uid}`, JSON.stringify(item));
                                        // Garante presença na lista de "em progresso"
                                        const listKey = `joinedTrails:${uid}`;
                                        const raw = await AsyncStorage.getItem(listKey);
                                        const arr = raw ? JSON.parse(raw) : [];
                                        const exists = Array.isArray(arr) && arr.some(t => String(t?.trailId) === String(item?.trailId));
                                        if (!exists) {
                                            const newItem = { trailId: item?.trailId, trailName: item?.trailName, icon: item?.trailIcon || item?.icon || null };
                                            await AsyncStorage.setItem(listKey, JSON.stringify([...arr, newItem]));
                                        }
                                    } catch {}
                                    navigation.navigate('Trilha', { trailId: item?.trailId, trailName: item?.trailName });
                                } else {
                                    setShowPassword(true);
                                }
                            } catch (e) {
                                // fallback: caso dê erro, mostra o modal
                                setShowPassword(true);
                            }
                        }}
                    >
                        <Text style={styles.TextTrilha} > Explorar  </Text>
                        <IconSeta width={15} height={24} fill="#CE82FF" />
                    </TouchableOpacity>

                </View>

                {/* Modal de senha da trilha */}
                <TrailPasswordModal
                    visible={showPassword}
                    onClose={() => setShowPassword(false)}
                    trailId={item?.trailId}
                    trailName={item?.trailName}
                    onSuccess={async (fullTrail) => {
                        setShowPassword(false);
                        // Salva a trilha completa retornada pelo backend (preferível) por usuário
                        try {
                            const rawUser = await AsyncStorage.getItem('userInfo');
                            const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                            const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';
                            const full = fullTrail || item;
                            await AsyncStorage.setItem(`currentTrail:${uid}`, JSON.stringify(full));
                            // Adiciona na lista de "em progresso"
                            const listKey = `joinedTrails:${uid}`;
                            const raw = await AsyncStorage.getItem(listKey);
                            const arr = raw ? JSON.parse(raw) : [];
                            const exists = Array.isArray(arr) && arr.some(t => String(t?.trailId) === String(item?.trailId));
                            if (!exists) {
                                const newItem = { trailId: item?.trailId, trailName: item?.trailName, icon: item?.trailIcon || item?.icon || null };
                                await AsyncStorage.setItem(listKey, JSON.stringify([...arr, newItem]));
                            }
                        } catch {}
                        navigation.navigate('Trilha', { trailId: item?.trailId, trailName: item?.trailName });
                    }}
                />

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(90, 24, 154, 0.4)',
        borderWidth: 2,
        borderColor: '#5A189A',
        width: width * 0.9,
        height: 'auto',
        borderRadius: 25,
        justifyContent: 'flex-end',
        paddingBottom: 16,
        paddingTop: 16,
        paddingLeft: 14,
        paddingRight: 14,
    },
    BoxCard: {
        width: '100%',
        height: 'auto',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 15,
    },
    FotoTrilha: {
        width: 50,
        height: 50,
        backgroundColor: '#CE82FF33',
        borderRadius: 15
    },
    Infomações: {
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12
    },
    FotoIconTrilha: {
        backgroundColor: '#cd82ff3f',
        height: 50,
        width: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    TextTrilha: {
        color: '#CE82FF'
    },
    title: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15

    }
})