import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';

/**
 * Modal para validação de senha de trilha
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - onSuccess: (trail) => void  // chamado ao validar a senha
 * - trailId: string|number
 * - trailName: string
 */
export default function TrailPasswordModal({ visible, onClose, onSuccess, trailId, trailName }) {
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resetLocal = () => {
        setPassword('');
        setShow(false);
        setLoading(false);
        setError('');
    };

    const handleClose = () => {
        resetLocal();
        onClose?.();
    };

    // Busca a senha da trilha em estruturas variadas do backend
    const findTrailPassword = (payload, _depth = 0) => {
        if (!payload || typeof payload !== 'object' || _depth > 4) return null;

        const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
        const looksLikeTrailPwdKey = (k) => {
            const nk = norm(k);
            return (
                nk.includes('trailpassword') ||
                nk.includes('passwordtrail') ||
                nk.includes('trailpwd') ||
                nk.includes('trail_pass') ||
                nk.includes('trailpassword') ||
                (nk.includes('trail') && (nk.includes('password') || nk.includes('senha'))) ||
                (nk.includes('trilha') && nk.includes('senha')) ||
                nk === 'trail_password' || nk === 'trailpassword' || nk === 'password' || nk === 'senha' || nk === 'senhatrilha'
            );
        };

        // 1) Checa chaves diretas deste objeto
        for (const k of Object.keys(payload)) {
            if (looksLikeTrailPwdKey(k)) {
                const val = payload[k];
                if (val != null && (typeof val === 'string' || typeof val === 'number')) return val;
            }
        }

        // 2) Preferir nós conhecidos: trail / trilha
        for (const k of Object.keys(payload)) {
            const nk = norm(k);
            if (nk === 'trail' || nk === 'trilha') {
                const v = findTrailPassword(payload[k], _depth + 1);
                if (v != null) return v;
            }
        }

        // 3) Procura recursiva geral
        for (const k of Object.keys(payload)) {
            const child = payload[k];
            if (child && typeof child === 'object') {
                const v = findTrailPassword(child, _depth + 1);
                if (v != null) return v;
            }
        }

        return null;
    };

    const handleEnter = async () => {
        if (!trailId) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/trail/read/${trailId}`);

            console.log("[TrailPasswordModal] DATA COMPLETA RECEBIDA:");
            console.log(JSON.stringify(data, null, 2));
            // Log das chaves recebidas
            // try { console.log('[TrailPasswordModal] keys recebidas:', Object.keys(data || {})); } catch {}

            // Tentativa direta primeiro (mais barato):
            let direct = data?.trailPassword ?? data?.trail_password ?? data?.password ?? data?.senha;

            // Se veio número converte pra string
            if (typeof direct === 'number') direct = String(direct);
            if (typeof direct === 'string') direct = direct.trim();

            // Usa busca robusta apenas se direto falhar
            const rawServerPassword = direct || findTrailPassword(data);
            const serverPassword = rawServerPassword != null ? String(rawServerPassword).trim() : '';

            // Debug temporário (mascara metade):
            if (serverPassword) {
                const masked = serverPassword.length <= 2 ? '*'.repeat(serverPassword.length) : serverPassword[0] + '*'.repeat(serverPassword.length - 2) + serverPassword.slice(-1);
                console.log(`[TrailPasswordModal] senha extraída (mascada): ${masked} | len=${serverPassword.length}`);
            } else {
                console.log('[TrailPasswordModal] nenhuma senha extraída.');
            }

            if (!serverPassword) {
                setError('Não foi possível validar a senha da trilha.');
                setLoading(false);
                return;
            }

            const typed = String(password).trim();
            console.log(`[TrailPasswordModal] comparando digitada='${typed}' vs servidor(len=${serverPassword.length})`);
            if (typed !== serverPassword) {
                setError('Senha incorreta. Tente novamente.');
                setLoading(false);
                return;
            }

            // Chama JOIN para criar progresso no backend (idempotente)
            try {
                await api.post(`/progress/join/${trailId}`, null, {
                    params: { trailPassword: serverPassword || '' },
                });
            } catch (joinErr) {
                // Se já estiver atribuído ou senha não for mais necessária, apenas seguimos
                console.log('[TrailPasswordModal] join erro/ignorado:', joinErr?.response?.status, joinErr?.response?.data || joinErr.message);
            }

            // Persistir desbloqueio para não perguntar novamente (por usuário)
            let uid = 'anon';
            try {
                const rawUser = await AsyncStorage.getItem('userInfo');
                const parsed = rawUser ? JSON.parse(rawUser) : null;
                uid = parsed?.uid || parsed?.userId || parsed?.id || parsed?.email || 'anon';
            } catch {}

            const unlockedKey = `trailUnlocked:${uid}:${trailId}`;
            try { await AsyncStorage.setItem(unlockedKey, 'true'); } catch {}

            // Armazenar trilha atual (opcional)
            // Salva trilha atual por usuário
            try { await AsyncStorage.setItem(`currentTrail:${uid}`, JSON.stringify(data)); } catch { }

            // Adiciona a trilha na lista de "em progresso" do usuário (joinedTrails:uid)
            try {
                const key = `joinedTrails:${uid}`;
                const raw = await AsyncStorage.getItem(key);
                const arr = raw ? JSON.parse(raw) : [];
                const exists = Array.isArray(arr) && arr.some(t => String(t?.trailId) === String(trailId));
                const newItem = {
                    trailId: data?.trailId ?? trailId,
                    trailName: data?.trailName ?? trailName ?? 'Trilha',
                    // campos auxiliares opcionais
                    icon: data?.trailIcon || data?.icon || null,
                };
                const next = exists ? arr : [...arr, newItem];
                await AsyncStorage.setItem(key, JSON.stringify(next));
            } catch {}

            resetLocal();
            onSuccess?.(data);
        } catch (e) {
            console.log('Erro ao validar senha da trilha:', e?.response?.data || e.message);
            setError('Erro ao validar. Verifique a conexão e tente novamente.');
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Participar de {trailName || 'Trilha'}</Text>
                        <TouchableOpacity onPress={handleClose} accessibilityLabel="Fechar">
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Por favor informe a senha para entrar na Trilha</Text>
                    <Text style={[styles.label, { marginTop: 14 }]}>Digite a Senha da Trilha</Text>

                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            placeholderTextColor="#9AA0A6"
                            secureTextEntry={!show}
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShow(p => !p)} style={styles.eyeBtn}>
                            <Text style={styles.eyeText}>{show ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {!!error && <Text style={styles.error}>{error}</Text>}

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleEnter} disabled={loading || !password}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryText}>Entrar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#0f1219',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#2A2F3A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        width: '85%',
    
    },
    close: {
        color: '#c9c9c9',
        fontSize: 18,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    subtitle: {
        color: '#bfc3c9',
        marginTop: 8,
        paddingBottom: 8,
        paddingTop: 8,
    },
    label: {
        color:
            '#bfc3c9'
    },
    inputRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3C4250',
        borderRadius: 10,
        paddingLeft: 12,
        paddingRight: 8,
        backgroundColor: '#141924',
    },
    input: {
        flex: 1,
        color: '#fff',
        height: 44,
    },
    eyeBtn: { paddingHorizontal: 6, paddingVertical: 6 },
    eyeText: { fontSize: 16, color: '#c9c9c9' },
    primaryBtn: {
        marginTop: 16,
        height: 44,
        backgroundColor: '#6C63FF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700' },
    error: { color: '#ff6b6b', marginTop: 10 },
});
