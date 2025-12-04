import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useMemo } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import IconUpload from '../../../assets/svg/upload-cloudRoxo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';
import ModalEntrega from '../../components/ModalEntrega&Sucesso/ModalEntrega';
import ModalSucessoEntrega from '../../components/ModalEntrega&Sucesso/ModalSucessoEntrega';
import { getLimitsForUI, getActivitySubmissionsCount, getFlagsTimer } from '../../services/submissionService';
import useFlagsTimer from '../../hooks/useFlagsTimer';
import { CommentsSection } from '../../components/CommentsSection/CommentsSection';
import SkeletonActivity from '../../components/Skeletons/SkeletonActivity';
import { fetchEquippedPet } from '../../services/petService';

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


export default function PageAtividade() {
    const route = useRoute();
    const navigation = useNavigation();
    const {
        activityId,
        activityName,
        activityDescription,
        activityPrice,
        activityDifficulty,
        trailId,
        trailName,
        index
    } = route.params || {};

    const [file, setFile] = useState(null); // { uri, name, mimeType, size }
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [ensuringProgress, setEnsuringProgress] = useState(false);
    const [userData, setUserData] = useState(null);
    const [previousUserData, setPreviousUserData] = useState(null);
    const [petData, setPetData] = useState(null);
    const [previousPetData, setPreviousPetData] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [activityStatus, setActivityStatus] = useState(null);
    const [progressId, setProgressId] = useState(null);
    const [limits, setLimits] = useState(null); // { perActivity, flags, shouldBlock, blockReason }
    const [initialLoading, setInitialLoading] = useState(true);
    const { hhmmss, start: startTimer, reset: resetTimer } = useFlagsTimer(0);

    const filePreviewIsImage = useMemo(() => {
        const mt = file?.mimeType || '';
        return mt.startsWith('image/');
    }, [file]);

    // Log params para debug
    React.useEffect(() => {
        console.log('PageAtividade params', route.params);
        fetchUser();
        fetchPet(); // Buscar pet ao carregar página
        fetchProgressAndSubmissions();
    }, [route.params]);

    // Carrega limites (entregas por atividade e flags globais) quando já soubermos o progressId
    React.useEffect(() => {
        const loadLimits = async () => {
            try {
                if (!progressId) return;
                const l = await getLimitsForUI({ progressId });
                setLimits(l);
                if (l?.flags?.flagGenerateTimer > 0) {
                    startTimer(l.flags.flagGenerateTimer);
                } else {
                    resetTimer(0);
                }
            } catch (e) {
                console.log('[PageAtividade] Erro ao carregar limites:', e);
            }
        };
        loadLimits();
    }, [progressId]);

    // ajuda simples para inferir mime pela extensão quando o picker não retorna
    const inferMimeTypeFromName = (name = '') => {
        const ext = name.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'pdf':
                return 'application/pdf';
            case 'zip':
                return 'application/zip';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default:
                return 'application/octet-stream';
        }
    };

    const fetchUser = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            // O interceptor já adiciona Authorization
            const res = await api.get('/users/readOne');
            const newUser = res.data;
            setUserData(newUser);
            // Salvar no AsyncStorage
            await AsyncStorage.setItem('userInfo', JSON.stringify(newUser));
            return newUser;
        } catch (e) {
            console.log('Erro ao buscar usuário:', e);
        }
    };

    const fetchPet = async () => {
        try {
            const pet = await fetchEquippedPet();
            setPetData(pet);
            return pet;
        } catch (e) {
            console.log('Erro ao buscar pet equipado:', e);
            return null;
        }
    };

    const fetchProgressAndSubmissions = async () => {
        try {
            setInitialLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            if (!token || !trailId) {
                setInitialLoading(false);
                return;
            }
            // O interceptor já adiciona Authorization
            const res = await api.get(`/progress/read/${trailId}`);
            const progressList = res.data?.progressList || [];
            const activityProgress = progressList.find(p => Number(p.activityId) === Number(activityId));
            if (activityProgress) {
                setActivityStatus(activityProgress.activityStatus);
                setProgressId(activityProgress.progressId);
                if (activityProgress.activityStatus === 'COMPLETE' && activityProgress.progressId) {
                    // Buscar submissões (interceptor adiciona Authorization)
                    const subRes = await api.get(`/submission/delivered/${activityProgress.progressId}`);
                    setSubmissions(subRes.data || []);
                }
            }
        } catch (e) {
            console.log('Erro ao buscar progresso:', e);
        } finally {
            setInitialLoading(false);
        }
    };

    const handlePickFile = async () => {
        try {
            // Importa somente quando necessário (compatível com ESM e CJS)
            const mod = await import('expo-document-picker');
            const DocumentPicker = mod?.default ?? mod;

            if (!DocumentPicker || typeof DocumentPicker.getDocumentAsync !== 'function') {
                alert('Para enviar arquivos, é necessário reconstruir o app com o módulo DocumentPicker. Feche o app, rode "expo run:android" (ou atualize o Expo Go) e tente novamente.');
                return;
            }

            if (typeof DocumentPicker.isAvailableAsync === 'function') {
                try {
                    const available = await DocumentPicker.isAvailableAsync();
                    if (!available) {
                        alert('Seleção de documentos indisponível neste app. Reconstrua com expo-document-picker (expo run:android) ou atualize o Expo Go.');
                        return;
                    }
                } catch { }
            }
            const res = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                multiple: false,
                copyToCacheDirectory: true,
            });
            let asset = null;
            // SDK 49+ (expo-document-picker >= 14): { canceled, assets: [...] }
            if (res && typeof res === 'object' && 'canceled' in res) {
                if (res.canceled) return;
                asset = Array.isArray(res.assets) && res.assets.length > 0 ? res.assets[0] : null;
            } else if (res && typeof res === 'object') {
                // Legado: { type: 'success' | 'cancel', uri, name, size, mimeType }
                if (res.type === 'success') asset = res;
            }

            if (!asset) return;

            setFile({
                uri: asset.uri,
                name: asset.name || 'arquivo',
                mimeType: asset.mimeType || inferMimeTypeFromName(asset.name),
                size: asset.size || 0,
            });
        } catch (e) {
            console.log('Erro ao carregar/usar DocumentPicker:', e?.message || e);
            // Feedback amigável quando o módulo nativo não está presente no binário atual
            alert('Para enviar arquivos, é necessário reconstruir o app com o módulo DocumentPicker. Feche o app, rode "expo run:android" (ou atualize o Expo Go) e tente novamente.');
        }
    };

    const ensureProgressInitialized = async () => {
        if (!trailId) return;
        try {
            setEnsuringProgress(true);
            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error('Token ausente');

            const password = await AsyncStorage.getItem(`trailPassword:${trailId}`);
            console.log('[ensureProgress] Senha recuperada:', password);
            console.log('[ensureProgress] Tentando join na trilha:', trailId);

            const query = password && password.length > 0 ? `?trailPassword=${encodeURIComponent(password)}` : "";
            // O interceptor já adiciona Authorization
            const resp = await api.post(`/progress/join/${trailId}${query}`);

            console.log('[ensureProgress] JOIN SUCCESS - status:', resp.status);
            console.log('[ensureProgress] JOIN SUCCESS - data length:', resp.data?.length);

            if (![200, 201].includes(resp.status) || !Array.isArray(resp.data) || resp.data.length === 0) {
                throw new Error('Join não inicializou progresso.');
            }
            return resp.data;
        } catch (e) {
            console.log('========== ensureProgressInitialized ERROR ==========');
            console.log('  status:', e?.response?.status);
            console.log('  statusText:', e?.response?.statusText);
            console.log('  data:', e?.response?.data);
            console.log('  headers:', e?.response?.headers);
            console.log('  message:', e?.message);
            console.log('  full error:', JSON.stringify(e, null, 2));
            console.log('=====================================================');

            if (e?.response?.status === 403) {
                Alert.alert('Acesso negado', 'Sessão inválida. Faça login novamente.');
            } else if (e?.response?.status === 400) {
                // Tentar extrair mensagem do servidor de várias formas
                let serverMsg = 'Erro desconhecido (servidor não retornou detalhes)';
                if (e?.response?.data) {
                    if (typeof e?.response?.data === 'string' && e.response.data.length > 0) {
                        serverMsg = e.response.data;
                    } else if (typeof e?.response?.data === 'object') {
                        serverMsg = JSON.stringify(e.response.data);
                    }
                }
                console.log('[ensureProgress] Mensagem de erro do servidor:', serverMsg);
                Alert.alert('Erro ao entrar na trilha', `${serverMsg}\n\nSe você já está na trilha ou é o criador, pode tentar enviar a atividade mesmo assim.`);
            } else {
                const msg = e?.userMessage || 'Erro ao inicializar progresso da trilha.';
                Alert.alert('Erro', msg);
            }
            throw e;
        } finally {
            setEnsuringProgress(false);
        }
    };

    const submitActivity = async () => {
        if (!file || !trailId || !activityId) return;

        setUploading(true);

        try {
            setPreviousUserData(userData);

            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error('Token ausente. Faça login novamente.');

            // Decodificar token para obter userId
            let userIdFromToken = null;
            try {
                const decoded = decodeJWT(token);
                userIdFromToken = decoded?.userId;
            } catch (e) {
                console.log('Erro ao decodificar token para userId:', e);
            }

            // Verificar se o usuário é criador da trilha
            let isCreator = false;
            // Temporariamente forçar para trilhas novas (ajuste conforme necessário)
            if (trailId == 21) isCreator = true; // trilha teste
            if (userIdFromToken) {
                try {
                    // O interceptor já adiciona Authorization
                    const trailResp = await api.get(`/trail/read/${trailId}`);
                    console.log('Trail data:', trailResp.data);
                    isCreator = trailResp.data?.userId == userIdFromToken || trailId == 21; // fallback
                    console.log('Trail userId:', trailResp.data?.userId, 'UserId from token:', userIdFromToken, 'Is creator:', isCreator);
                } catch (e) {
                    console.log('Erro ao verificar criador da trilha:', e);
                    // Fallback: assumir criador para trilhas próprias
                    isCreator = true; // temporário
                }
            }

            // Verificar se o progresso já existe (join deve ter sido feito ao entrar na trilha)
            if (!isCreator) {
                console.log('[submitActivity] Verificando se progresso existe para atividade', activityId);
                try {
                    const chk = await api.get(`/progress/read/${trailId}`);
                    const progressList = chk?.data?.progressList || [];
                    const existsHere = progressList.some(p => Number(p.activityId) === Number(activityId));

                    if (!existsHere) {
                        // Progresso não existe - tentar criar via join
                        console.log('[submitActivity] Progresso não encontrado, tentando join...');
                        const password = await AsyncStorage.getItem(`trailPassword:${trailId}`);
                        if (!password) {
                            throw new Error('Você precisa entrar na trilha com a senha antes de enviar atividades.');
                        }

                        const joinResp = await ensureProgressInitialized();
                        const found = Array.isArray(joinResp) && joinResp.some(p => Number(p.activityId) === Number(activityId));
                        if (!found) {
                            throw new Error('Não foi possível inicializar o progresso. Entre na trilha novamente.');
                        }
                    } else {
                        console.log('[submitActivity] Progresso encontrado, pode enviar atividade');
                    }
                } catch (checkErr) {
                    console.log('[submitActivity] Erro ao verificar progresso:', checkErr.message);
                    throw checkErr;
                }
            } else {
                console.log('Usuário é criador da trilha, pulando verificação de join.');
            }

            // monta FormData
            const form = new FormData();

            // Garantir que URI está no formato correto para React Native
            let fileUri = file.uri;
            // No Android, URIs podem vir sem file:// ou como content://
            // Para upload, geralmente funciona melhor manter a URI original
            if (fileUri && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
                fileUri = `file://${fileUri}`;
            }

            const fileName = file.name || `arquivo_${Date.now()}.${file.mimeType?.split("/")[1] || "bin"}`;
            const fileType = file.mimeType || inferMimeTypeFromName(file.name);

            console.log('[submitActivity] ===== PREPARANDO UPLOAD =====');
            console.log('[submitActivity] URI original:', file.uri);
            console.log('[submitActivity] URI processada:', fileUri);
            console.log('[submitActivity] Nome:', fileName);
            console.log('[submitActivity] Tipo:', fileType);
            console.log('[submitActivity] Tamanho:', file.size);

            // IMPORTANTE: usar exatamente o nome "activityFiles" (backend espera isso)
            form.append("activityFiles", {
                uri: fileUri,
                name: fileName,
                type: fileType,
            });

            console.log('[submitActivity] FormData criado, verificando...');
            console.log('[submitActivity] FormData instanceof FormData?', form instanceof FormData);


            // Upload direto via fetch para evitar header incorreto aplicado pelo axios em alguns ambientes RN
            console.log('[submitActivity] Enviando PUT (fetch) para /progress/submit/trail/', trailId, '/activity/', activityId);
            const tokenFetch = await AsyncStorage.getItem('userToken');
            const fetchResp = await fetch(`${api.defaults.baseURL}/progress/submit/trail/${trailId}/activity/${activityId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${tokenFetch}`
                    // Sem Content-Type para permitir boundary automático
                },
                body: form
            });
            console.log('[submitActivity] Fetch status upload:', fetchResp.status);
            if (!fetchResp.ok) {
                const txtErr = await fetchResp.text();
                // Backend retorna mensagens de erro como texto no body (HTTP 400)
                // Exemplos: "Limite de 5 entregas atingido para esta atividade!"
                //           "Entregas - Limite atingido. Tente novamente em Xh e Ym"
                const error = new Error(txtErr || `Erro ao enviar atividade (status ${fetchResp.status})`);
                error.response = { status: fetchResp.status, data: txtErr };
                throw error;
            }
            const txtOk = await fetchResp.text();
            console.log('[submitActivity] ✅ Upload bem-sucedido (fetch) body:', txtOk);

            // Salvar estado anterior do pet antes de atualizar
            setPreviousPetData(petData);

            // Após sucesso, buscar novo user e pet em paralelo
            const [newUser, newPet] = await Promise.all([
                fetchUser(),
                fetchPet()
            ]);

            // Montar mensagem de feedback com XP, moedas e pet
            let feedbackMsg = '';
            let hadBoost = false;

            // Verificar se tinha pet equipado e HAPPY antes da entrega
            if (petData && petData.apprenticeInventoryEquipped && petData.apprenticePetEnergy >= (petData.petMinEnergy || 0)) {
                hadBoost = true;
            }

            if (previousUserData && newUser) {
                const deltaXp = (newUser.userXp || 0) - (previousUserData.userXp || 0);
                const deltaMoney = (newUser.userMoney || 0) - (previousUserData.userMoney || 0);

                if (deltaXp > 0) {
                    feedbackMsg += `\n✨ +${deltaXp} XP${hadBoost ? ' (com boost do pet 🐾)' : ''}!`;
                }
                if (deltaMoney > 0) {
                    feedbackMsg += `\n💰 +${deltaMoney} Moedas${hadBoost ? ' (com boost do pet 🐾)' : ''}!`;
                }

                // Verificar mudança de rank
                if (previousUserData.userRank !== newUser.userRank) {
                    Alert.alert('🎉 Parabéns!', `Você subiu para ${newUser.userRank}!${feedbackMsg}`);
                } else if (feedbackMsg) {
                    Alert.alert('✅ Atividade Enviada!', feedbackMsg.trim());
                }
            }

            // Verificar mudanças no pet
            if (previousPetData && newPet && newPet.apprenticeInventoryEquipped) {
                const oldEnergy = previousPetData.apprenticePetEnergy || 0;
                const newEnergy = newPet.apprenticePetEnergy || 0;
                const minEnergy = newPet.petMinEnergy || 0;

                if (oldEnergy > newEnergy) {
                    const energyLost = oldEnergy - newEnergy;
                    console.log(`[Pet] Energia reduzida: ${oldEnergy} → ${newEnergy} (-${energyLost})`);
                    
                    // Avisar se pet ficou EXHAUSTED
                    if (newEnergy < minEnergy && oldEnergy >= minEnergy) {
                        setTimeout(() => {
                            Alert.alert(
                                '😴 Pet Cansado!',
                                `Seu pet está exausto e perdeu os boosts!\n🔋 Energia: ${newEnergy}/${newPet.petMaxEnergy}\n\nAlimente-o para reativar os boosts! 🍖`
                            );
                        }, 1500);
                    }
                }
            }

            // Recarregar progresso e submissões
            await fetchProgressAndSubmissions();

            // Atualizar limites após envio bem-sucedido
            if (progressId) {
                try {
                    const updatedLimits = await getLimitsForUI({ progressId });
                    setLimits(updatedLimits);
                    if (updatedLimits?.flags?.flagGenerateTimer > 0) {
                        startTimer(updatedLimits.flags.flagGenerateTimer);
                    } else {
                        resetTimer(0);
                    }
                } catch (e) {
                    console.log('[submitActivity] Erro ao atualizar limites:', e);
                }
            }

            // Atualiza progresso local para Biblioteca e desbloqueio da próxima
            try {
                const rawUser = await AsyncStorage.getItem('userInfo');
                const parsed = rawUser ? JSON.parse(rawUser) : null;
                const uid = parsed?.uid || parsed?.userId || parsed?.id || parsed?.email || 'anon';

                // Recalcula percentual com base no index atual e total
                let total = 0;
                try {
                    const stored = await AsyncStorage.getItem(`currentTrail:${uid}`);
                    const t = stored ? JSON.parse(stored) : null;
                    total = Array.isArray(t?.activities) ? t.activities.length : 0;
                } catch { }
                const percent = total > 0 ? Math.round(((Number(index) + 1) / total) * 100) : 0;
                await AsyncStorage.setItem(`trailProgress:${uid}:${trailId}`, String(percent));

                // Guarda maior índice concluído para destravar próxima
                try {
                    const key = `completedActivities:${uid}:${trailId}`;
                    const current = await AsyncStorage.getItem(key);
                    const prev = current != null ? Number(current) : -1;
                    const next = Math.max(prev, Number(index));
                    await AsyncStorage.setItem(key, String(next));
                } catch { }
            } catch { }

            setShowConfirm(false);
            setShowSuccess(true);

        } catch (e) {
            console.log('[submitActivity] ❌ ERRO NO UPLOAD');
            console.log('[submitActivity] Erro completo:', e);
            // Sem fallback axios agora; fetch já é caminho principal

            if (e?.response?.status === 403) {
                Alert.alert('Acesso negado', 'Token expirado ou sem permissão. Faça login novamente.');
                // opcional: limpar token e redirecionar login
            } else {
                // Extrair mensagem de erro do backend
                let errMsg = 'Erro ao enviar arquivo.';

                if (e?.response?.data) {
                    const data = e.response.data;
                    if (typeof data === 'string') {
                        errMsg = data;
                    } else if (data?.message) {
                        errMsg = data.message;
                    } else if (data?.responseMsg) {
                        errMsg = data.responseMsg;
                    }
                } else if (e?.message) {
                    errMsg = e.message;
                } else if (e?.userMessage) {
                    errMsg = e.userMessage;
                }

                console.log('[submitActivity] Erro:', errMsg);
                Alert.alert('Erro ao enviar', errMsg);
            }
        }
        setUploading(false);
    };

    if (initialLoading) {
        return <SkeletonActivity />;
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={{ color: '#928cffff' }}>Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{activityName || 'Atividade'}</Text>
            </View>

            <View style={styles.descriptionBox}>
                <Text style={styles.boxTitle}>Atividade {index != null ? index + 1 : ''}: {activityName}</Text>
                <Text style={styles.description}>{activityDescription || 'Sem descrição.'}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Dificuldade: {activityDifficulty || 'N/D'}</Text>
                    <Text style={styles.metaText}>XP: {activityPrice ?? 0}</Text>
                </View>
            </View>

            {submissions.length > 0 && (
                <View style={styles.submissionsBox}>
                    <Text style={styles.boxTitle}>Entregas anteriores</Text>
                    {submissions.map((userSub, idx) => (
                        userSub.submissions.map((s, sidx) => (
                            <TouchableOpacity key={`${idx}-${sidx}`} onPress={() => Linking.openURL(s.submissionArchiveUrl)}>
                                <Text style={styles.submissionText}>{s.submissionOriginalName}</Text>
                            </TouchableOpacity>
                        ))
                    ))}
                </View>
            )}

            {/* Topo: Limites */}
            <View style={styles.limitsBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={styles.boxTitle}>Entregas desta atividade</Text>
                    <Text style={styles.limitValue}>{limits?.perActivity?.used ?? 0}/5</Text>
                </View>
                {limits?.perActivity?.atLimit && (
                    <Text style={styles.warningText}>⚠️ Limite de 5 entregas atingido para esta atividade!</Text>
                )}

                <View style={{ marginTop: 5, paddingTop: 5}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={styles.boxTitle}>Bandeiras restantes</Text>
                        <Text style={styles.limitValue}>{limits?.flags?.flagsQtd ?? 0}</Text>
                    </View>
                    {(limits?.flags?.flagsQtd ?? 0) <= 0 && (
                        <Text style={styles.timerText}>Reseta em: {hhmmss}</Text>
                    )}
                </View>
            </View>

            {/* Card do Pet e Boosts */}
            {petData && petData.apprenticeInventoryEquipped && (
                <View style={styles.petBoostCard}>
                    <View style={styles.petBoostHeader}>
                        <Text style={styles.petBoostTitle}>🐾 Pet Equipado</Text>
                        {petData.apprenticePetEnergy >= (petData.petMinEnergy || 0) ? (
                            <Text style={styles.petStatusHappy}>⚡ HAPPY</Text>
                        ) : (
                            <Text style={styles.petStatusExhausted}>😴 CANSADO</Text>
                        )}
                    </View>

                    <View style={styles.petBoostContent}>
                        {petData.petOutfitUrl && (
                            <Image source={{ uri: petData.petOutfitUrl }} style={styles.petBoostImage} />
                        )}
                        <View style={styles.petBoostInfo}>
                            <Text style={styles.petBoostName}>{petData.petOutfitName || petData.petName || 'Pet'}</Text>
                            
                            {petData.apprenticePetEnergy >= (petData.petMinEnergy || 0) ? (
                                <View style={styles.petBoostStats}>
                                    <Text style={styles.petBoostStat}>✨ XP: x{petData.petBoostXp || 1}</Text>
                                    <Text style={styles.petBoostStat}>💰 Moedas: x{petData.petBoostMoney || 1}</Text>
                                    <Text style={styles.petBoostStat}>🍖 Comida: x{petData.petBoostFood || 1}</Text>
                                </View>
                            ) : (
                                <Text style={styles.petBoostWarning}>
                                    Alimente seu pet para ativar os boosts!
                                </Text>
                            )}
                            
                            <View style={styles.petEnergyBar}>
                                <View 
                                    style={[
                                        styles.petEnergyFill, 
                                        { 
                                            width: `${Math.min(100, Math.max(0, ((petData.apprenticePetEnergy || 0) / (petData.petMaxEnergy || 100)) * 100))}%`,
                                            backgroundColor: petData.apprenticePetEnergy >= (petData.petMinEnergy || 0) ? '#4CAF50' : '#FF6B6B'
                                        }
                                    ]} 
                                />
                            </View>
                            <Text style={styles.petEnergyText}>
                                🔋 Energia: {petData.apprenticePetEnergy || 0}/{petData.petMaxEnergy || 100}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <Text style={styles.boxTitle}>Sua entrega</Text>

            {/* Espaço para futura entrega de arquivo / inputs */}
            <View style={styles.box}>
                <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }} onPress={handlePickFile}>
                    {file && filePreviewIsImage ? (
                        <Image source={{ uri: file.uri }} style={{ width: 120, height: 120, borderRadius: 8 }} />
                    ) : (
                        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffffff', width: 56, height: 56, borderRadius: 100 }}>
                            <IconUpload width={25} height={25} fill="#FFF" />
                        </View>
                    )}

                    <Text style={{ color: '#ffffffff', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
                        {file ? file.name : 'Clique para enviar sua entrega'}
                    </Text>
                    {!!file && (
                        <Text style={{ color: '#B7B7B7', fontSize: 12, textAlign: 'center', marginTop: 6 }}>
                            {file.mimeType}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handlePickFile}><Text style={styles.actionText}>Escolher arquivo</Text></TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.actionBtn,
                        {
                            backgroundColor: (file && !limits?.shouldBlock) ? '#6C63FF' : '#6C63FF55'
                        }
                    ]}
                    disabled={!file || limits?.shouldBlock}
                    onPress={() => {
                        // Bloqueia localmente se já atingir limites
                        if (limits?.perActivity?.atLimit) {
                            Alert.alert(
                                'Limite por atividade',
                                'Limite de 5 entregas atingido para esta atividade!'
                            );
                            return;
                        }
                        if ((limits?.flags?.flagsQtd ?? 0) <= 0) {
                            Alert.alert(
                                'Limite global',
                                `Entregas - Limite atingido. Tente novamente em ${hhmmss}.`
                            );
                            return;
                        }
                        setShowConfirm(true);
                    }}
                >
                    <Text style={[styles.actionText, { color: '#FFF' }]}>Entregar atividade</Text>
                </TouchableOpacity>
            </View>

            {/* Sistema de comentários em tempo real */}
            <CommentsSection activityId={activityId} />


            {/* Modal de confirmação */}
            <ModalEntrega
                visible={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={submitActivity}
                loading={uploading || ensuringProgress}
            />

            {/* Modal de sucesso */}
            <ModalSucessoEntrega
                visible={showSuccess}
                onClose={() => setShowSuccess(false)}
                onConfirm={() => {
                    setShowSuccess(false);
                    navigation.goBack(); // Volta para a tela anterior (Trail)
                }}
            />

            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#021713',
        padding: 20,
        paddingTop: 55,
        width: '100%',
    },
    limitsBox: {
        backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    limitLabel: {
        color: '#B7B7B7',
        fontSize: 12
    },
    limitValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700'
    },
    timerText: {
        color: '#CE82FF',
        marginTop: 6,
        fontSize: 12,
        textAlign: 'right'
    },
    warningText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '600'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#6C63FF55'
    },
    title: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: 'bold'
    },
    box: {
        width: '100%',
        height: 150,
        backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 25,
        borderWidth: 2,
        borderColor: '#ffffffc2'
    },
    boxTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8
    },
    description: {
        color: '#E5E5E5',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    metaText: {
        color: '#B3B3B3',
        fontSize: 12
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        justifyContent: 'center',

    },
    actionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10
    },
    actionText: {
        color: '#928cffff',
        fontWeight: '600'
    },
    descriptionBox: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 35,
        width: '100%',
    },
    submissionsBox: {
        backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 25,
    },
    submissionText: {
        color: '#E5E5E5',
        fontSize: 14,
        marginBottom: 8
    },
    // Estilos do Pet Boost Card
    petBoostCard: {
        backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#6C63FF',
    },
    petBoostHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    petBoostTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    petStatusHappy: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
        backgroundColor: '#4CAF5020',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    petStatusExhausted: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B6B',
        backgroundColor: '#FF6B6B20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    petBoostContent: {
        flexDirection: 'row',
        gap: 12,
    },
    petBoostImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#163028',
    },
    petBoostInfo: {
        flex: 1,
    },
    petBoostName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 6,
    },
    petBoostStats: {
        marginBottom: 8,
    },
    petBoostStat: {
        fontSize: 12,
        color: '#E5E5E5',
        marginBottom: 2,
    },
    petBoostWarning: {
        fontSize: 12,
        color: '#FF9800',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    petEnergyBar: {
        height: 6,
        backgroundColor: '#163028',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    petEnergyFill: {
        height: '100%',
        borderRadius: 3,
    },
    petEnergyText: {
        fontSize: 11,
        color: '#B7B7B7',
    },

})
