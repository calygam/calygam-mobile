import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Envia um comentário (top-level ou resposta)
 * @param {number} activityId - ID da atividade
 * @param {object} payload - SendMessageDTO
 * @param {number|null} replyToMessageActivityId - ID da mensagem para responder (opcional)
 * @returns {Promise}
 */
export const sendComment = async (activityId, payload, replyToMessageActivityId = null) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Token ausente');

    let url = `/message/activity/${activityId}/send`;
    if (replyToMessageActivityId) {
      url += `?messageActivityId=${replyToMessageActivityId}`;
    }

    const response = await api.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('[commentService] Erro ao enviar comentário:', error);
    throw error;
  }
};

/**
 * Lista comentários principais (top-level) com paginação
 * @param {number} activityId - ID da atividade
 * @param {number} page - Número da página (default: 0)
 * @param {number} size - Tamanho da página (default: 20)
 * @param {number|null} lastMsgId - ID da última mensagem carregada (opcional)
 * @returns {Promise<{content: Array, hasNext: boolean}>}
 */
export const loadComments = async (activityId, page = 0, size = 20, lastMsgId = null) => {
  try {
    const params = { activityId, page, size };
    if (lastMsgId) params.lastMsgId = lastMsgId;

    const response = await api.get('/message/activity/list-all-basics', { params });
    return response.data; // CommentNextDTO
  } catch (error) {
    console.error('[commentService] Erro ao carregar comentários:', error);
    throw error;
  }
};

/**
 * Lista respostas de um comentário específico
 * @param {number} messageActivityId - ID do comentário pai
 * @param {number} activityId - ID da atividade
 * @param {number} page - Número da página (default: 0)
 * @param {number} size - Tamanho da página (default: 20)
 * @param {number|null} lastMsgId - ID da última resposta carregada (opcional)
 * @returns {Promise<{content: Array, hasNext: boolean}>}
 */
export const loadReplies = async (messageActivityId, activityId, page = 0, size = 20, lastMsgId = null) => {
  try {
    const params = { activityId, page, size };
    if (lastMsgId) params.lastMsgId = lastMsgId;

    const response = await api.get(`/message/activity/list-all-response/${messageActivityId}`, { params });
    return response.data; // CommentNextDTO
  } catch (error) {
    console.error('[commentService] Erro ao carregar respostas:', error);
    throw error;
  }
};

/**
 * Edita um comentário existente
 * @param {number} messageActivityId - ID do comentário a editar
 * @param {number} activityId - ID da atividade
 * @param {boolean} msgResponse - Se é uma resposta ou comentário principal
 * @param {object} payload - SendMessageDTO com novo conteúdo
 * @param {number|null} lastMsgId - ID da última mensagem (opcional)
 * @param {number} page - Número da página (default: 0)
 * @param {number} size - Tamanho da página (default: 20)
 * @returns {Promise}
 */
export const editComment = async (messageActivityId, activityId, msgResponse, payload, lastMsgId = null, page = 0, size = 20) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Token ausente');

    const params = { activityId, msgResponse, page, size };
    if (lastMsgId) params.lastMsgId = lastMsgId;

    const response = await api.put(`/message/activity/update/${messageActivityId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

    return response.data; // CommentNextDTO
  } catch (error) {
    console.error('[commentService] Erro ao editar comentário:', error);
    throw error;
  }
};

/**
 * Deleta um comentário
 * @param {number} messageActivityId - ID do comentário a deletar
 * @param {number} activityId - ID da atividade
 * @returns {Promise}
 */
export const deleteComment = async (messageActivityId, activityId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Token ausente');

    const response = await api.delete(`/message/activity/delete/${messageActivityId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { activityId }
    });

    return response.data; // ApiSucessHandler<String>
  } catch (error) {
    console.error('[commentService] Erro ao deletar comentário:', error);
    throw error;
  }
};
