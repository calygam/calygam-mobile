import { useState, useEffect, useCallback } from 'react';
import { fetchTeachers, enrichTrailsWithTeachers, clearTeachersCache } from '../services/teacherService';

/**
 * Hook customizado para gerenciar dados de professores
 * Facilita o uso do teacherService em componentes React
 */
export const useTeacherData = () => {
    const [teachers, setTeachers] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Carrega professores do backend
     * @param {boolean} forceRefresh - Se true, ignora cache
     */
    const loadTeachers = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        
        try {
            const teacherMap = await fetchTeachers(forceRefresh);
            setTeachers(teacherMap);
            return teacherMap;
        } catch (err) {
            console.error('[useTeacherData] Erro ao carregar professores:', err);
            setError(err);
            return new Map();
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Busca um professor específico pelo ID
     * @param {number} userId - ID do professor
     * @returns {object|null} Dados do professor
     */
    const getTeacher = useCallback((userId) => {
        if (!userId) return null;
        return teachers.get(userId) || null;
    }, [teachers]);

    /**
     * Enriquece trilhas com dados dos professores
     * @param {Array} trails - Array de trilhas
     * @returns {Promise<Array>} Trilhas enriquecidas
     */
    const enrichTrails = useCallback(async (trails) => {
        return await enrichTrailsWithTeachers(trails, false);
    }, []);

    /**
     * Limpa o cache e recarrega
     */
    const refresh = useCallback(async () => {
        clearTeachersCache();
        return await loadTeachers(true);
    }, [loadTeachers]);

    // Carrega professores na montagem do componente
    useEffect(() => {
        loadTeachers();
    }, [loadTeachers]);

    return {
        teachers,
        loading,
        error,
        loadTeachers,
        getTeacher,
        enrichTrails,
        refresh
    };
};

export default useTeacherData;
