import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native'
import React, { useState, useMemo } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import IconUpload from '../../../assets/svg/upload-cloudRoxo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';
import ModalEntrega from '../../components/ModalEntrega&Sucesso/ModalEntrega';
import ModalSucessoEntrega from '../../components/ModalEntrega&Sucesso/ModalSucessoEntrega';

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
    const [submissions, setSubmissions] = useState([]);
    const [activityStatus, setActivityStatus] = useState(null);
    const [progressId, setProgressId] = useState(null);

    const filePreviewIsImage = useMemo(() => {
        const mt = file?.mimeType || '';
        return mt.startsWith('image/');
    }, [file]);

    // Log params para debug
    React.useEffect(() => {
        console.log('PageAtividade params', route.params);
        fetchUser();
        fetchProgressAndSubmissions();
    }, [route.params]);

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

    const fetchProgressAndSubmissions = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token || !trailId) return;
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
                } catch {}
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
            const resp = await api.post(`/progress/join/${trailId}${query}`, {});

            console.log('[ensureProgress] JOIN SUCCESS - status:', resp.status);
            console.log('[ensureProgress] JOIN SUCCESS - data length:', resp.data?.length);
            
            if (![200,201].includes(resp.status) || !Array.isArray(resp.data) || resp.data.length === 0) {
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

            form.append("activityFiles", {
                uri: file.uri.startsWith("file://") ? file.uri : file.uri.replace("content://", "file://"),
                name: file.name || `arquivo.${file.mimeType?.split("/")[1] || "bin"}`,
                type: file.mimeType || inferMimeTypeFromName(file.name),
            });

            // Adicionar nome original se necessário
            form.append('activityOriginalFileName', file.name || 'arquivo');

            console.log("Enviando:", {
                uri: file.uri,
                name: file.name,
                type: file.mimeType,
            });

            // Para RN, às vezes precisa setar Content-Type, mas deixe o axios gerar boundary
            // Não defina manualmente 'Content-Type' para multipart/form-data (boundary é necessário).
            // Confie no interceptor de `api` para adicionar Authorization. Mantemos Accept e timeout.
            await api.put(
                `/progress/submit/trail/${trailId}/activity/${activityId}`,
                form,
                {
                    headers: {
                        Accept: '*/*',
                    },
                    timeout: 120000 // Aumentar timeout para 2 minutos
                }
            );

            // Após sucesso, buscar novo user e detectar level-up
            const newUser = await fetchUser();
            if (previousUserData && newUser) {
                if (previousUserData.userRank !== newUser.userRank) {
                    Alert.alert('Parabéns!', `Você subiu para ${newUser.userRank}!`);
                } else if ((newUser.userXp || 0) > (previousUserData.userXp || 0)) {
                    const delta = (newUser.userXp || 0) - (previousUserData.userXp || 0);
                    Alert.alert('XP Ganho!', `Você ganhou ${delta} XP!`);
                }
            }

            // Recarregar progresso e submissões
            await fetchProgressAndSubmissions();


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
                } catch {}
                const percent = total > 0 ? Math.round(((Number(index) + 1) / total) * 100) : 0;
                await AsyncStorage.setItem(`trailProgress:${uid}:${trailId}`, String(percent));

                // Guarda maior índice concluído para destravar próxima
                try {
                    const key = `completedActivities:${uid}:${trailId}`;
                    const current = await AsyncStorage.getItem(key);
                    const prev = current != null ? Number(current) : -1;
                    const next = Math.max(prev, Number(index));
                    await AsyncStorage.setItem(key, String(next));
                } catch {}
            } catch {}

            setShowConfirm(false);
            setShowSuccess(true);

        } catch (e) {
            console.log("Erro completo upload:", e);
            console.log("err.response:", e.response);
            console.log("err.request:", e.request);
            console.log("err.message:", e.message);
            if (e?.response?.status === 403) {
                Alert.alert('Acesso negado', 'Token expirado ou sem permissão. Faça login novamente.');
                // opcional: limpar token e redirecionar login
            } else {
                const msg = e?.userMessage || 'Erro ao enviar arquivo.';
                Alert.alert('Erro', msg);
            }
            // mantém sua lógica de apresentação de erro (errMsg)
            let errMsg = "Erro desconhecido";

            if (e.response && e.response.data) {
                try {
                    errMsg = typeof e.response.data === "string"
                        ? e.response.data
                        : JSON.stringify(e.response.data);
                } catch {
                    errMsg = "Erro ao processar a resposta do servidor.";
                }
            } else if (e.message) {
                errMsg = e.message;
            }

            console.log("Falha upload:", errMsg);
            alert(`Erro ao enviar arquivo:\n\n${errMsg}`);
        }
        setUploading(false);
    };

    return (
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
                    style={[styles.actionBtn, { backgroundColor: file ? '#6C63FF' : '#6C63FF55' }]}
                    disabled={!file}
                    onPress={() => setShowConfirm(true)}
                >
                    <Text style={[styles.actionText, { color: '#FFF' }]}>Entregar atividade</Text>
                </TouchableOpacity>
            </View>

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
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#021713',
        padding: 20,
        paddingTop: 55
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
        backgroundColor: '#592ced56',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10
    },
    actionText: {
        color: '#928cffff',
        fontWeight: '600'
    },
    descriptionBox: {
        // backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 25,
        // borderWidth: 1,
        // borderColor: '#6C63FF55'
    },
    submissionsBox: {
        backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 25,
        borderWidth: 2,
        borderColor: '#ffffffc2'
    },
    submissionText: {
        color: '#E5E5E5',
        fontSize: 14,
        marginBottom: 8
    }
})
