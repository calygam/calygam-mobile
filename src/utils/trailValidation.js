import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Valida se uma trilha ainda existe no backend
 * @param {string|number} trailId - ID da trilha
 * @returns {Promise<{exists: boolean, data: object|null, error: string|null}>}
 */
export const validateTrailExists = async (trailId) => {
    if (!trailId) {
        return { exists: false, data: null, error: 'ID da trilha não fornecido' };
    }

    try {
        const response = await api.get(`/trail/read/${trailId}`);
        
        if (!response.data) {
            return { exists: false, data: null, error: 'Trilha retornou dados vazios' };
        }

        return { exists: true, data: response.data, error: null };
    } catch (err) {
        const status = err?.response?.status;
        
        // 404 ou 500 geralmente significa que a trilha foi deletada
        if (status === 404 || status === 500) {
            return { exists: false, data: null, error: `Trilha não encontrada (${status})` };
        }
        
        // Outros erros (rede, etc) - retorna erro mas não assume que foi deletada
        return { exists: false, data: null, error: err?.message || 'Erro ao verificar trilha' };
    }
};

/**
 * Remove uma trilha do cache do usuário
 * @param {string|number} trailId - ID da trilha
 * @param {string} uid - ID do usuário (opcional, será buscado se não fornecido)
 * @returns {Promise<boolean>} - true se foi removida, false caso contrário
 */
export const removeTrailFromCache = async (trailId, uid = null) => {
    try {
        // Buscar UID se não fornecido
        if (!uid) {
            const rawUser = await AsyncStorage.getItem('userInfo');
            const parsed = rawUser ? JSON.parse(rawUser) : null;
            uid = parsed?.uid || parsed?.userId || parsed?.id || parsed?.email || 'anon';
        }

        const joinedKey = `joinedTrails:${uid}`;
        const rawJoined = await AsyncStorage.getItem(joinedKey);
        const joinedArr = rawJoined ? JSON.parse(rawJoined) : [];
        
        // Remove a trilha da lista
        const filtered = joinedArr.filter(t => String(t?.trailId) !== String(trailId));
        
        // Atualiza o cache apenas se houve mudança
        if (filtered.length !== joinedArr.length) {
            await AsyncStorage.setItem(joinedKey, JSON.stringify(filtered));
            
            // Remove também outros dados relacionados
            try {
                await AsyncStorage.removeItem(`trailProgress:${uid}:${trailId}`);
                await AsyncStorage.removeItem(`progressList:${uid}:${trailId}`);
                await AsyncStorage.removeItem(`trailPassword:${trailId}`);
                await AsyncStorage.removeItem(`trailUnlocked:${uid}:${trailId}`);
                await AsyncStorage.removeItem(`progressJoined:${uid}:${trailId}`);
                await AsyncStorage.removeItem(`completedActivities:${uid}:${trailId}`);
            } catch (cleanupErr) {
                console.log('[removeTrailFromCache] Erro ao limpar dados relacionados:', cleanupErr);
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('[removeTrailFromCache] Erro ao remover trilha do cache:', error);
        return false;
    }
};

/**
 * Valida e filtra uma lista de trilhas, removendo as que foram deletadas
 * @param {Array} trails - Array de trilhas para validar
 * @param {string} uid - ID do usuário (opcional)
 * @returns {Promise<{validTrails: Array, removedCount: number}>}
 */
export const validateAndFilterTrails = async (trails, uid = null) => {
    if (!Array.isArray(trails) || trails.length === 0) {
        return { validTrails: [], removedCount: 0 };
    }

    // Buscar UID se não fornecido
    if (!uid) {
        try {
            const rawUser = await AsyncStorage.getItem('userInfo');
            const parsed = rawUser ? JSON.parse(rawUser) : null;
            uid = parsed?.uid || parsed?.userId || parsed?.id || parsed?.email || 'anon';
        } catch {
            uid = 'anon';
        }
    }

    const validTrails = [];
    let removedCount = 0;

    // Validar cada trilha em paralelo (mais rápido)
    const validationPromises = trails.map(async (trail) => {
        if (!trail?.trailId) {
            console.log('[validateAndFilterTrails] ⚠️ Trilha sem ID - pulando');
            return { valid: false, trail };
        }

        const validation = await validateTrailExists(trail.trailId);
        
        if (!validation.exists) {
            console.log(`[validateAndFilterTrails] ❌ Trilha ${trail.trailId} não existe - removendo`);
            // Remove do cache
            await removeTrailFromCache(trail.trailId, uid);
            return { valid: false, trail };
        }

        // Atualiza dados da trilha com informações do backend
        const updatedTrail = {
            ...trail,
            trailImage: validation.data?.trailImage || trail.trailImage,
            trailName: validation.data?.trailName || trail.trailName,
            trailIcon: validation.data?.trailIcon || trail.trailIcon,
        };

        return { valid: true, trail: updatedTrail };
    });

    const results = await Promise.all(validationPromises);
    
    results.forEach((result) => {
        if (result.valid) {
            validTrails.push(result.trail);
        } else {
            removedCount++;
        }
    });

    // Atualiza o cache com apenas trilhas válidas
    if (removedCount > 0) {
        const joinedKey = `joinedTrails:${uid}`;
        await AsyncStorage.setItem(joinedKey, JSON.stringify(validTrails));
        console.log(`[validateAndFilterTrails] 🧹 Cache atualizado: ${removedCount} trilhas removidas`);
    }

    return { validTrails, removedCount };
};



