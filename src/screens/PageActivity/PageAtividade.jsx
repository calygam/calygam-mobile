import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native'
import React, { useState, useMemo } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import IconUpload from '../../../assets/svg/upload-cloudRoxo.svg';
// Import dinâmico será usado para evitar crash caso o módulo nativo ainda não esteja linkado
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';


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

    const filePreviewIsImage = useMemo(() => {
        const mt = file?.mimeType || '';
        return mt.startsWith('image/');
    }, [file]);

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

    // Garante que exista um registro de progresso (JOIN) antes de submeter
    const ensureProgressInitialized = async () => {
        if (!trailId) return;
        try {
            setEnsuringProgress(true);
            await api.post(`/progress/join/${trailId}`);
        } catch (e) {
            // Pode retornar erro se já estiver atribuído; mantemos log e seguimos
            console.log('ensureProgressInitialized:', e?.response?.status, e?.response?.data || e.message);
        } finally {
            setEnsuringProgress(false);
        }
        return true;
    };

    const submitActivity = async () => {
        if (!file || !trailId || !activityId) return;

        setUploading(true);

        try {
            // garante progresso na trilha antes do submit
            await ensureProgressInitialized();

            const form = new FormData();

            form.append("file", {
                uri: file.uri.startsWith("file://") ? file.uri : file.uri.replace("content://", "file://"),
                name: file.name || `arquivo.${file.mimeType?.split("/")[1] || "bin"}`,
                type: file.mimeType || inferMimeTypeFromName(file.name),
            });

            console.log("Enviando:", {
                uri: file.uri,
                name: file.name,
                type: file.mimeType,
            });

            await api.put(
                `/progress/submit/trail/${trailId}/activity/${activityId}`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Accept": "*/*"
                    }
                }
            );

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
            const errMsg = e?.response?.data || e?.message || e;
            console.log("Falha upload:", errMsg);
            alert(`Erro ao enviar arquivo.\n\n${typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)}`);
        } finally {
            setUploading(false);
        }
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
            <Modal visible={showConfirm} transparent animationType="fade" onRequestClose={() => setShowConfirm(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Deseja Entregar?</Text>
                        <Text style={styles.modalSubtitle}>Após a confirmação você não poderá cancelar o envio dessa atividade novamente.</Text>
                        <View style={{ gap: 10, marginTop: 12 }}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#6C63FF' }]} onPress={submitActivity} disabled={uploading || ensuringProgress}>
                                {(uploading || ensuringProgress) ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnText}>Confirmar</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#3A3F4A' }]} onPress={() => setShowConfirm(false)} disabled={uploading}>
                                <Text style={styles.modalBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de sucesso */}
            <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => setShowSuccess(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Atividade entregue!</Text>
                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: '#6C63FF', marginTop: 12 }]}
                            onPress={() => {
                                setShowSuccess(false);
                                navigation.navigate('Trilha', { trailId, trailName });
                            }}
                        >
                            <Text style={styles.modalBtnText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#0f1219',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#2A2F3A',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    modalSubtitle: {
        color: '#bfc3c9',
        fontSize: 13,
    },
    modalBtn: {
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: { color: '#fff', fontWeight: '700' },
})
