import { useState, useCallback, useEffect } from 'react';
import { loadComments, sendComment, editComment, deleteComment, loadReplies } from '../services/commentService';
import { Alert } from 'react-native';

/**
 * Hook para gerenciar comentários de uma atividade em tempo real
 * @param {number} activityId - ID da atividade
 * @param {number} autoRefreshInterval - Intervalo de auto-refresh em ms (default: 5000)
 */
export const useComments = (activityId, autoRefreshInterval = 5000) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(0);
  const [lastMsgId, setLastMsgId] = useState(null);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega comentários iniciais
  const fetchComments = useCallback(async (isRefresh = false) => {
    if (!activityId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const currentPage = isRefresh ? 0 : page;
      const currentLastMsgId = isRefresh ? null : lastMsgId;

      const result = await loadComments(activityId, currentPage, 20, currentLastMsgId);
      
      if (isRefresh) {
        // Refresh total - substitui tudo
        setComments(result.content || []);
        setPage(0);
        setLastMsgId(null);
      } else if (currentPage === 0) {
        // Primeira carga
        setComments(result.content || []);
      } else {
        // Carregar mais - adiciona ao final
        setComments(prev => [...prev, ...(result.content || [])]);
      }

      setHasNext(result.hasNext || false);

      // Atualizar lastMsgId se houver conteúdo
      if (result.content && result.content.length > 0) {
        const lastItem = result.content[result.content.length - 1];
        setLastMsgId(lastItem.messageActivityId);
      }
    } catch (error) {
      console.error('[useComments] Erro ao carregar comentários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comentários.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activityId, page, lastMsgId]);

  // Carrega mais comentários (paginação)
  const loadMore = useCallback(() => {
    if (!loading && hasNext) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasNext]);

  // Envia um novo comentário
  const sendNewComment = useCallback(async (text, type = 'MESSAGE_CONTRIBUTION', replyToId = null) => {
    if (!text || !text.trim()) {
      Alert.alert('Atenção', 'Digite um comentário antes de enviar.');
      return false;
    }

    try {
      setSending(true);

      const payload = {
        messageActivityDescription: text.trim(),
        messageActivityType: replyToId ? 'MESSAGE_REPLY' : type,
        messageActivityIsPrivate: false
      };

      await sendComment(activityId, payload, replyToId);

      // Refresh para mostrar novo comentário
      await fetchComments(true);

      return true;
    } catch (error) {
      console.error('[useComments] Erro ao enviar comentário:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Erro ao enviar comentário.';
      Alert.alert('Erro', errorMsg);
      return false;
    } finally {
      setSending(false);
    }
  }, [activityId, fetchComments]);

  // Edita um comentário existente
  const updateComment = useCallback(async (messageActivityId, newText, isReply = false) => {
    if (!newText || !newText.trim()) {
      Alert.alert('Atenção', 'Digite o novo conteúdo antes de salvar.');
      return false;
    }

    try {
      const payload = {
        messageActivityDescription: newText.trim()
      };

      await editComment(messageActivityId, activityId, isReply, payload);

      // Refresh para mostrar comentário editado
      await fetchComments(true);

      return true;
    } catch (error) {
      console.error('[useComments] Erro ao editar comentário:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Erro ao editar comentário.';
      Alert.alert('Erro', errorMsg);
      return false;
    }
  }, [activityId, fetchComments]);

  // Remove um comentário
  const removeComment = useCallback(async (messageActivityId) => {
    try {
      await deleteComment(messageActivityId, activityId);

      // Refresh para atualizar lista
      await fetchComments(true);

      return true;
    } catch (error) {
      console.error('[useComments] Erro ao deletar comentário:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Erro ao deletar comentário.';
      Alert.alert('Erro', errorMsg);
      return false;
    }
  }, [activityId, fetchComments]);

  // Auto-refresh para simular "tempo real"
  useEffect(() => {
    if (!activityId || !autoRefreshInterval) return;

    const interval = setInterval(() => {
      fetchComments(true);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [activityId, autoRefreshInterval, fetchComments]);

  // Carrega comentários ao montar e quando page muda
  useEffect(() => {
    if (page > 0) {
      fetchComments(false);
    }
  }, [page]);

  // Carga inicial
  useEffect(() => {
    if (activityId) {
      fetchComments(false);
    }
  }, [activityId]);

  return {
    comments,
    loading,
    hasNext,
    sending,
    refreshing,
    fetchComments,
    loadMore,
    sendNewComment,
    updateComment,
    removeComment,
    refresh: () => fetchComments(true)
  };
};

/**
 * Hook para gerenciar respostas de um comentário específico
 * @param {number} messageActivityId - ID do comentário pai
 * @param {number} activityId - ID da atividade
 */
export const useReplies = (messageActivityId, activityId) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(0);
  const [lastMsgId, setLastMsgId] = useState(null);

  const fetchReplies = useCallback(async (isRefresh = false) => {
    if (!messageActivityId || !activityId) return;

    try {
      setLoading(true);

      const currentPage = isRefresh ? 0 : page;
      const currentLastMsgId = isRefresh ? null : lastMsgId;

      const result = await loadReplies(messageActivityId, activityId, currentPage, 10, currentLastMsgId);
      
      if (isRefresh || currentPage === 0) {
        setReplies(result.content || []);
        setPage(0);
        setLastMsgId(null);
      } else {
        setReplies(prev => [...prev, ...(result.content || [])]);
      }

      setHasNext(result.hasNext || false);

      if (result.content && result.content.length > 0) {
        const lastItem = result.content[result.content.length - 1];
        setLastMsgId(lastItem.messageActivityId);
      }
    } catch (error) {
      console.error('[useReplies] Erro ao carregar respostas:', error);
    } finally {
      setLoading(false);
    }
  }, [messageActivityId, activityId, page, lastMsgId]);

  const loadMore = useCallback(() => {
    if (!loading && hasNext) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasNext]);

  useEffect(() => {
    if (page > 0) {
      fetchReplies(false);
    }
  }, [page]);

  useEffect(() => {
    if (messageActivityId && activityId) {
      fetchReplies(false);
    }
  }, [messageActivityId, activityId]);

  return {
    replies,
    loading,
    hasNext,
    fetchReplies,
    loadMore,
    refresh: () => fetchReplies(true)
  };
};
