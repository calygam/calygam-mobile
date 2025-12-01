import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Serviço para buscar e gerenciar informações de professores
 * Implementa cache em memória para evitar chamadas repetidas
 */

// Cache em memória (válido durante a sessão do app)
let teachersCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Busca todos os professores do backend e retorna um Map userId -> professor
 * @param {boolean} forceRefresh - Se true, ignora cache e busca do backend
 * @returns {Promise<Map<number, object>>} Map com userId como chave e dados do professor
 */
export const fetchTeachers = async (forceRefresh = false) => {
    try {
        // Verifica se tem cache válido
        const now = Date.now();
        const cacheValid = teachersCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);
        
        if (!forceRefresh && cacheValid) {
            console.log('[TeacherService] 📦 Usando cache de professores');
            return teachersCache;
        }

        console.log('[TeacherService] 🔄 Buscando professores do backend...');
        
        // Busca professores com paginação grande (size=500 para pegar todos)
        // Endpoint: GET /users/readAllUsers/teacher?page=0&size=500&sort=userId,desc
        const response = await api.get('/users/readAllUsers/teacher', {
            params: {
                page: 0,
                size: 500,
                sort: 'userId,desc'
            }
        });

        // Backend retorna Page<DataUtilUserDTO>
        // Pode vir como { content: [...] } ou diretamente como array
        const teachersArray = response.data?.content || response.data || [];
        
        console.log(`[TeacherService] ✅ ${teachersArray.length} professores carregados`);

        // Cria Map para lookup rápido: userId -> professor
        const teacherMap = new Map();
        teachersArray.forEach(teacher => {
            if (teacher?.userId) {
                teacherMap.set(teacher.userId, {
                    userId: teacher.userId,
                    userName: teacher.userName || 'Professor',
                    userImage: teacher.userImage || null, // URL completa já vem do backend
                    userEmail: teacher.userEmail || null,
                    userRole: teacher.userRole || 'TEACHER'
                });
            }
        });

        // Atualiza cache
        teachersCache = teacherMap;
        cacheTimestamp = now;

        return teacherMap;
    } catch (error) {
        console.error('[TeacherService] 💥 Erro ao buscar professores:', error?.response?.status, error?.response?.data || error.message);
        
        // Se falhar, retorna Map vazio para não quebrar a UI
        return new Map();
    }
};

/**
 * Busca um professor específico pelo userId
 * @param {number} userId - ID do professor
 * @param {boolean} forceRefresh - Se true, atualiza cache antes de buscar
 * @returns {Promise<object|null>} Dados do professor ou null se não encontrado
 */
export const getTeacherById = async (userId, forceRefresh = false) => {
    if (!userId) {
        return null;
    }

    try {
        const teacherMap = await fetchTeachers(forceRefresh);
        return teacherMap.get(userId) || null;
    } catch (error) {
        console.error('[TeacherService] Erro ao buscar professor:', error);
        return null;
    }
};

/**
 * Enriquece uma lista de trilhas com dados dos professores
 * @param {Array} trails - Array de TrailDTO com campo 'user' (userId)
 * @param {boolean} forceRefresh - Se true, atualiza cache antes de enriquecer
 * @returns {Promise<Array>} Array de trilhas com dados do professor adicionados
 */
export const enrichTrailsWithTeachers = async (trails, forceRefresh = false) => {
    if (!Array.isArray(trails) || trails.length === 0) {
        return [];
    }

    try {
        console.log(`[TeacherService] 🔧 Enriquecendo ${trails.length} trilhas com dados de professores...`);
        
        const teacherMap = await fetchTeachers(forceRefresh);

        const enrichedTrails = trails.map(trail => {
            const userId = trail?.user; // TrailDTO tem campo 'user' com o userId
            const teacher = userId ? teacherMap.get(userId) : null;

            return {
                ...trail,
                // Adiciona dados do professor diretamente na trilha
                professorUserId: userId || null,
                professorName: teacher?.userName || 'Professor não encontrado',
                professorImage: teacher?.userImage || null,
                professorEmail: teacher?.userEmail || null,
                // Mantém compatibilidade com código antigo
                professor: teacher || null
            };
        });

        console.log('[TeacherService] ✅ Trilhas enriquecidas com sucesso');
        return enrichedTrails;
    } catch (error) {
        console.error('[TeacherService] 💥 Erro ao enriquecer trilhas:', error);
        // Retorna trilhas originais sem enriquecimento para não quebrar
        return trails;
    }
};

/**
 * Limpa o cache de professores (útil para forçar atualização)
 */
export const clearTeachersCache = () => {
    console.log('[TeacherService] 🧹 Limpando cache de professores');
    teachersCache = null;
    cacheTimestamp = null;
};

/**
 * Verifica se o cache está válido
 * @returns {boolean} true se cache existe e é válido
 */
export const isCacheValid = () => {
    const now = Date.now();
    return teachersCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);
};
