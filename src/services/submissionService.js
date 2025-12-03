import api from '../api/api';

/**
 * Serviço para submissões de atividades e limites (flags)
 * 
 * Endpoints do backend:
 * - GET /flags/get-timer -> { flagsQtd, flagGenerateTimer }
 * - GET /submission/download/{progressId} -> lista de arquivos enviados
 * - PUT /progress/submit/trail/{trailId}/activity/{activityId} -> enviar arquivos (multipart)
 * - GET /progress/read/{trailId} -> lista de atividades com progressId
 * - GET /progress/read/unlocked/{trailId} -> atividade desbloqueada atual
 * 
 * Limites:
 * - Por atividade: máximo 5 entregas por progressId
 * - Global (flags): 12 entregas a cada 100 minutos (reset automático pelo backend)
 */

// ---- Flags / Timer ----
/**
 * Busca flags globais e timer de reset
 * @returns {Promise<{flagsQtd: number, flagGenerateTimer: number}>}
 * - flagsQtd: quantidade de envios restantes (0-12)
 * - flagGenerateTimer: segundos até reset (só > 0 se flagsQtd = 0)
 */
export async function getFlagsTimer() {
  try {
    const res = await api.get('/flags/get-timer');
    const data = res?.data || {};
    return {
      flagsQtd: Number(data.flagsQtd ?? 0),
      flagGenerateTimer: Number(data.flagGenerateTimer ?? 0), // em segundos
    };
  } catch (err) {
    console.error('[submissionService] Erro ao buscar flags/timer:', err);
    // Retorna valores padrão em caso de erro
    return {
      flagsQtd: 0,
      flagGenerateTimer: 0,
    };
  }
}

// ---- Submissões por atividade ----
/**
 * Busca lista de arquivos já enviados para uma atividade
 * @param {number} progressId - ID do progresso da atividade
 * @returns {Promise<Array>} Lista de submissões
 */
export async function getSubmissions(progressId) {
  if (!progressId) throw new Error('progressId é obrigatório');
  try {
    const res = await api.get(`/submission/download/${progressId}`);
    const arr = Array.isArray(res?.data) ? res.data : [];
    return arr;
  } catch (err) {
    console.error('[submissionService] Erro ao buscar submissões:', err);
    return [];
  }
}

/**
 * Conta quantas entregas já foram feitas para uma atividade
 * @param {number} progressId - ID do progresso da atividade
 * @returns {Promise<number>} Número de entregas (0-5)
 */
export async function getActivitySubmissionsCount(progressId) {
  if (!progressId) return 0;
  try {
    const arr = await getSubmissions(progressId);
    return arr.length;
  } catch (err) {
    console.error('[submissionService] Erro ao contar submissões:', err);
    return 0;
  }
}

/**
 * Calcula limite por atividade (máximo 5)
 * @param {number} used - Quantas entregas já foram feitas
 * @param {number} max - Máximo permitido (padrão: 5)
 * @returns {object} { used, max, remaining, atLimit }
 */
export function calcPerActivityLimit(used, max = 5) {
  const u = Number(used || 0);
  const remaining = Math.max(0, max - u);
  return {
    used: u,
    max,
    remaining,
    atLimit: u >= max,
  };
}

// ---- Upload (multipart) ----
/**
 * Envia arquivos para uma atividade
 * @param {object} params
 * @param {number} params.trailId - ID da trilha
 * @param {number} params.activityId - ID da atividade
 * @param {Array<{uri: string, name: string, type: string}>} params.files - Arquivos para enviar
 * @returns {Promise<string>} Mensagem de sucesso do backend
 * @throws {Error} Se houver erro (com mensagem do backend)
 * 
 * Erros possíveis do backend (HTTP 400):
 * - "Você não enviou nenhum arquivo!"
 * - "Limite de 5 entregas atingido para esta atividade!"
 * - "Entregas - Limite atingido. Tente novamente em Xh e Ym"
 */
export async function submitActivity({ trailId, activityId, files }) {
  if (!trailId || !activityId) {
    throw new Error('trailId e activityId são obrigatórios');
  }
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('Selecione pelo menos um arquivo');
  }

  const form = new FormData();
  files.forEach((f, i) => {
    // Esperado: { uri, name, type }
    // name: obrigatório para RN + axios multipart
    const name = f.name || `arquivo_${i + 1}`;
    const type = f.type || 'application/octet-stream';
    const uri = f.uri || f.path || f.fileCopyUri;
    if (!uri) return; // ignora inválidos

    // Campo esperado pelo backend: activityFiles[]
    form.append('activityFiles', { uri, name, type });
  });

  try {
    // PUT /progress/submit/trail/{trailId}/activity/{activityId}
    // Backend espera multipart/form-data com campo "activityFiles"
    const res = await api.put(
      `/progress/submit/trail/${trailId}/activity/${activityId}`, 
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    
    // Backend retorna 200 OK com mensagem (ex.: "Atividade Enviada com sucesso!")
    const message = res?.data;
    return typeof message === 'string' ? message : 'Atividade enviada com sucesso!';
  } catch (err) {
    // Mensagens de erro importantes vêm como texto no body (HTTP 400)
    let msg = 'Falha ao enviar atividade';
    
    if (err?.response?.data) {
      const data = err.response.data;
      if (typeof data === 'string') {
        msg = data;
      } else if (data?.message) {
        msg = data.message;
      } else if (data?.responseMsg) {
        msg = data.responseMsg;
      }
    } else if (err?.message) {
      msg = err.message;
    }
    
    throw new Error(msg);
  }
}

// ---- Desbloqueada atual (opcional) ----
/**
 * Busca atividade desbloqueada atual da trilha
 * @param {number} trailId - ID da trilha
 * @returns {Promise<object|null>} Dados da atividade desbloqueada ou null
 */
export async function getUnlockedProgress(trailId) {
  if (!trailId) throw new Error('trailId é obrigatório');
  try {
    const res = await api.get(`/progress/read/unlocked/${trailId}`);
    return res?.data ?? null; // projection com activity/progress atual
  } catch (err) {
    console.error('[submissionService] Erro ao buscar atividade desbloqueada:', err);
    return null;
  }
}

// ---- UI helpers ----
/**
 * Converte segundos em formato HH:MM:SS
 * @param {number} total - Total de segundos
 * @returns {object} { hours, minutes, seconds, hhmmss }
 */
export function secondsToHms(total) {
  const s = Math.max(0, Number(total || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    hours,
    minutes,
    seconds,
    hhmmss: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}

/**
 * Busca todos os limites para exibir na UI
 * @param {object} params
 * @param {number} params.progressId - ID do progresso da atividade
 * @returns {Promise<object>} { perActivity, flags, shouldBlock, blockReason }
 */
export async function getLimitsForUI({ progressId }) {
  if (!progressId) {
    throw new Error('progressId é obrigatório');
  }

  try {
    // Buscar em paralelo: contagem de entregas e flags globais
    const [count, flags] = await Promise.all([
      getActivitySubmissionsCount(progressId),
      getFlagsTimer(),
    ]);

    const perActivity = calcPerActivityLimit(count, 5);
    const flagsBlock = Number(flags.flagsQtd) <= 0;

    return {
      perActivity, // { used, max:5, remaining, atLimit }
      flags,       // { flagsQtd, flagGenerateTimer }
      shouldBlock: perActivity.atLimit || flagsBlock,
      blockReason: perActivity.atLimit 
        ? 'activity-limit' 
        : (flagsBlock ? 'flags-limit' : null),
    };
  } catch (err) {
    console.error('[submissionService] Erro ao buscar limites:', err);
    // Retorna valores padrão em caso de erro
    return {
      perActivity: { used: 0, max: 5, remaining: 5, atLimit: false },
      flags: { flagsQtd: 0, flagGenerateTimer: 0 },
      shouldBlock: true,
      blockReason: 'error',
    };
  }
}

/**
 * Normaliza arquivos vindos de pickers para formato esperado
 * @param {any} picked - Arquivo(s) do picker
 * @returns {Array<{uri: string, name: string, type: string}>}
 */
export function normalizePickerFiles(picked) {
  if (!picked) return [];
  const arr = Array.isArray(picked) ? picked : [picked];
  return arr
    .filter(Boolean)
    .map((f, i) => ({
      uri: f.uri || f.fileCopyUri || f.path,
      name: f.name || f.filename || `arquivo_${i + 1}`,
      type: f.mimeType || f.type || 'application/octet-stream',
    }))
    .filter((f) => !!f.uri);
}
