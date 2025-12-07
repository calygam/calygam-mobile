import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Alert } from 'react-native'
import { iconMap } from '../IconsModal/Icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import IconPessoas from "../../../assets/svg/IconsInterface/users-alt 2.svg";
import IconSeta from "../../../assets/svg/IconsCardExplorar/angulo-direito1.svg";
import TrailPasswordModal from '../TrailPasswordModal/TrailPasswordModal';
import api from '../../api/api';

const { width, height } = Dimensions.get('window')

export default function CardsTrilhas({ item, professorName, professorPhotoUrl, onRefresh, onEnter }) {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);

    const trailName = item?.trailName ?? 'Sem nome'
    
    // Cálculo de vagas: trailVacancy (ocupadas) / trailVacancies (total)
    // Backend envia: trailVacancy = número de pessoas que já entraram
    //                trailVacancies = limite total de vagas definido pelo professor
    const filled = Number(item?.trailVacancy || 0); // Vagas ocupadas
    const total = Number(item?.trailVacancies || 0); // Total de vagas
    const remaining = Math.max(0, total - filled); // Vagas restantes
    
    // Formata a exibição: "ocupadas/total" (ex: "20/45")
    const vacanciesDisplay = total > 0 ? `${filled}/${total}` : 'N/A';
    
    // Verificação robusta se tem senha: backend deve enviar trailHavePassword
    // Se não vier, tenta verificar se tem trailPassword preenchido
    const hasPassword = item?.trailHavePassword === true || 
                       (item?.trailPassword && item?.trailPassword !== '' && item?.trailPassword !== 'null')
    
    // Debug log para rastrear problema de senha
    if (item?.trailPassword) {
        console.log(`[CardsTrilhas] Trilha "${trailName}": trailHavePassword=${item?.trailHavePassword}, trailPassword presente=${!!item?.trailPassword}, hasPassword final=${hasPassword}`);
    }

    // Escolha de mídia: prioridade para IMAGEM REAL do backend; senão ícone SVG; senão placeholder
    const renderTrailVisual = () => {
        const trailImage = item?.trailImage || null;
        const iconNameRaw = item?.trailIcon || item?.icon || null;

        // PRIORIDADE 1: Imagem real do backend (via /file/read/{uuid})
        // Verifica se tem imagem válida (URL completa, não apenas /file/read/)
        const hasValidImage = trailImage && 
                             !trailImage.includes('/file/read/null') && 
                             !trailImage.includes('null') &&
                             !trailImage.endsWith('/file/read/') &&
                             trailImage.length > 'https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/file/read/'.length;
        
        if (hasValidImage) {
            return (
                <View style={styles.FotoIconTrilha}>
                    <Image 
                        source={{ uri: trailImage }} 
                        style={{ width: '100%', height: '100%', borderRadius: 12 }} 
                        resizeMode="cover"
                        onError={(e) => {
                            console.log('[CardsTrilhas] Erro ao carregar imagem:', trailImage);
                        }}
                    />
                </View>
            );
        }

        // PRIORIDADE 2: Ícone SVG
        if (iconNameRaw) {
            const key = iconNameRaw.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
            const IconComponent = iconMap[key];

            if (IconComponent) {
                return (
                    <View style={styles.FotoIconTrilha}>
                        <IconComponent width={28} height={28} fill="#FFF" />
                    </View>
                );
            }
        }

        // FALLBACK: Placeholder padrão
        return (
            <View style={[styles.FotoIconTrilha, { backgroundColor: '#fffffff3' }]}>
                <Image source={require('../../../assets/image/ImagemSem.png')} style={{ width: 28, height: 28 }} />
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <View style={styles.BoxCard}>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 }}>
                        <View style={styles.FotoTrilha}>
                            {renderTrailVisual()}
                        </View>

                        <Text style={styles.title}>{trailName}</Text>
                    </View>

                    {/* Badge Pública/Privada */}
                    <View style={[styles.badge, { backgroundColor: hasPassword ? '#c1121e95' : '#5acc0295' }]}>
                        <Text style={[styles.badgeText, { color: hasPassword ? '#FF7121' : '#CCFF33' }]}>{hasPassword ? 'Privada' : 'Pública'}</Text>
                    </View>
                </View>

                {/* Informações do Professor */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Image
                        source={professorPhotoUrl ? { uri: professorPhotoUrl } : require('../../../assets/image/ImagemSem.png')}
                        style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffffffff' }}
                        onError={(e) => {
                            console.log('[CardsTrilhas] Erro ao carregar foto do professor:', professorPhotoUrl);
                        }}
                    />
                    <Text style={{ color: '#B3B3B3', fontSize: 13 }}>Prof. {professorName ?? 'Desconhecido'}</Text>
                </View>

                <View style={styles.Infomações}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <IconPessoas width={15} height={24} fill="#CE82FF" />
                        <Text style={{ color: '#CE82FF', fontSize: 13 }}>
                            {total > 0 ? (
                                `Vagas: ${vacanciesDisplay} (${remaining} restantes)`
                            ) : (
                                'Vagas: N/A'
                            )}
                        </Text>
                    </View>


                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                        onPress={async () => {
                            // VALIDAÇÃO EM TEMPO REAL: Verificar se trilha ainda existe
                            if (!item?.trailId) {
                                Alert.alert('Erro', 'ID da trilha inválido');
                                return;
                            }

                            try {
                                const checkResponse = await api.get(`/trail/read/${item.trailId}`);
                                if (!checkResponse.data) {
                                    Alert.alert('Trilha Removida', 'Esta trilha não está mais disponível.');
                                    return;
                                }
                            } catch (err) {
                                if (err?.response?.status === 404 || err?.response?.status === 500) {
                                    Alert.alert('Trilha Removida', 'Esta trilha foi deletada e não está mais disponível.');
                                    // Remove do cache
                                    const rawUser = await AsyncStorage.getItem('userInfo');
                                    const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                                    const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';
                                    const joinedKey = `joinedTrails:${uid}`;
                                    const rawJoined = await AsyncStorage.getItem(joinedKey);
                                    const arr = rawJoined ? JSON.parse(rawJoined) : [];
                                    const filtered = arr.filter(t => t.trailId !== item.trailId);
                                    await AsyncStorage.setItem(joinedKey, JSON.stringify(filtered));
                                    // Recarrega a lista
                                    if (onRefresh) onRefresh();
                                    return;
                                }
                                console.error('Erro ao validar trilha:', err);
                            }

                            try {
                                const rawUser = await AsyncStorage.getItem('userInfo');
                                const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                                const uid = parsedUser?.uid || parsedUser?.userId || parsedUser?.id || parsedUser?.email || 'anon';

                                const unlockedKey = `trailUnlocked:${uid}:${item?.trailId}`;
                                const unlocked = await AsyncStorage.getItem(unlockedKey);

                                // SE NÃO TEM SENHA (trailHavePassword = false), entra direto
                                if (!hasPassword) {
                                    console.log('[CardsTrilhas] Trilha sem senha - entrando direto');
                                    try {
                                        // Salva trilha atual
                                        await AsyncStorage.setItem(`currentTrail:${uid}`, JSON.stringify(item));
                                        
                                        // Adiciona na lista de "em progresso"
                                        const listKey = `joinedTrails:${uid}`;
                                        const raw = await AsyncStorage.getItem(listKey);
                                        const arr = raw ? JSON.parse(raw) : [];
                                        const exists = Array.isArray(arr) && arr.some(t => String(t?.trailId) === String(item?.trailId));
                                        if (!exists) {
                                            const newItem = { 
                                                trailId: item?.trailId, 
                                                trailName: item?.trailName,
                                                trailImage: item?.trailImage || null, 
                                                icon: item?.trailIcon || item?.icon || null 
                                            };
                                            await AsyncStorage.setItem(listKey, JSON.stringify([...arr, newItem]));
                                        }
                                        
                                        // JOIN sem senha (sem query param)
                                        const joinedFlag = await AsyncStorage.getItem(`progressJoined:${uid}:${item?.trailId}`);
                                        if (!joinedFlag) {
                                            try {
                                                await api.post(`/progress/join/${item?.trailId}`);
                                                await AsyncStorage.setItem(`progressJoined:${uid}:${item?.trailId}`, 'true');
                                                await AsyncStorage.setItem(unlockedKey, 'true');
                                                console.log('[CardsTrilhas] JOIN sem senha: sucesso');
                                            } catch (joinErr) {
                                                console.log('[CardsTrilhas] JOIN sem senha falhou:', joinErr?.response?.status, joinErr?.response?.data || joinErr.message);
                                            }
                                        }
                                    } catch (err) {
                                        console.log('[CardsTrilhas] Erro ao entrar em trilha sem senha:', err);
                                    }
                                    navigation.navigate('Trilha', { trailId: item?.trailId, trailName: item?.trailName });
                                    // Recarrega lista após entrar
                                    if (onRefresh) onRefresh();
                                    return;
                                }

                                // SE TEM SENHA, SEMPRE pede senha (não confiar apenas no cache local)
                                // Mostra modal de senha para validar com backend
                                setShowPassword(true);
                            } catch (e) {
                                console.log('[CardsTrilhas] Erro geral:', e);
                                // fallback: se tem senha, mostra modal; senão tenta entrar direto
                                if (hasPassword) {
                                    setShowPassword(true);
                                } else {
                                    navigation.navigate('Trilha', { trailId: item?.trailId, trailName: item?.trailName });
                                }
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
                    onTrailJoined={() => {
                        // Recarrega lista após entrar com sucesso
                        if (onRefresh) onRefresh();
                    }}
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
                                const newItem = { 
                                    trailId: item?.trailId, 
                                    trailName: item?.trailName,
                                    trailImage: item?.trailImage || full?.trailImage || null, 
                                    icon: item?.trailIcon || item?.icon || null 
                                };
                                await AsyncStorage.setItem(listKey, JSON.stringify([...arr, newItem]));
                            }
                            // Marca que o JOIN já foi feito para evitar chamadas repetidas
                            try { await AsyncStorage.setItem(`progressJoined:${uid}:${item?.trailId}`, 'true'); } catch {}
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
        fontSize: 15,
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    badge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    }
})