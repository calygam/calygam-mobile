// Serviço central para lidar com progresso de trilhas, flags e submissões
// Referência dos endpoints (backend):
//  POST /progress/join/{trailId}?trailPassword=...
//  GET  /progress/read/{trailId}
//  GET  /progress/read/unlocked/{trailId}
//  GET  /flags/get-timer
//  PUT  /progress/submit/trail/{trailId}/activity/{activityId} (multipart: activityFiles)
//
// Observações importantes:
//  - Sempre enviar Authorization: Bearer {token}
//  - Upload multipart NÃO deve definir manualmente Content-Type (deixar fetch gerar boundary)
//  - Limites: 5 submissões por atividade, flags (entregas) regeneram a cada ~100 minutos
//  - Mensagens de erro do back podem vir como texto em 400; mapear para UI

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api'; // para chamadas JSON simples (axios) - exceto upload

// Flag interna para evitar upload concorrente duplicado
let submitting = false;

// Util: obter token atual
async function getAuthToken() {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Sessão expirada. Faça login novamente.');
  return token;
}

// Formata segundos em HH:MM:SS ou MM:SS dependendo do valor
export function formatFlagTimer(totalSeconds = 0) {
  if (totalSeconds <= 0) return '00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Normaliza respostas de erro do axios ou fetch
function normalizeError(err) {
  if (typeof err === 'string') return err;
  const status = err?.response?.status;
  const data = err?.response?.data;
  if (status && data) {
    if (typeof data === 'string' && data.trim().length) return data;
    if (data.message) return data.message;
  }
  if (err?.message) return err.message;
  return 'Erro inesperado. Tente novamente.';
}

// JOIN da trilha - cria progresso caso não exista
export async function joinTrail(trailId, trailPassword) {
  const token = await getAuthToken();
  const query = trailPassword ? `?trailPassword=${encodeURIComponent(trailPassword)}` : '';
  try {
    const resp = await api.post(`/progress/join/${trailId}${query}`); // sem body
    if (![200,201].includes(resp.status) || !Array.isArray(resp.data) || resp.data.length === 0) {
      throw new Error('Falha ao inicializar progresso da trilha.');
    }
    return resp.data; // lista ActivityProgressResponseDTO
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

// Lê progresso completo de uma trilha
export async function readProgress(trailId) {
  const token = await getAuthToken();
  try {
    const resp = await api.get(`/progress/read/${trailId}`);
    return resp.data; // { progressList: [...], activitiesCompleted: number }
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

// Lê atividade desbloqueada atual
export async function readUnlocked(trailId) {
  await getAuthToken();
  try {
    const resp = await api.get(`/progress/read/unlocked/${trailId}`);
    // Pode retornar objeto vazio/null
    return resp.data && Object.keys(resp.data).length ? resp.data : null;
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

// Consulta flags atuais do usuário
export async function getFlags() {
  await getAuthToken();
  try {
    const resp = await api.get('/flags/get-timer');
    // { flagsQtd, flagGenerateTimer }
    return resp.data;
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

// Submete atividade (upload de arquivos)
// filesArray: [{ uri, name, type }] - pode vir de DocumentPicker / ImagePicker
export async function submitActivity(trailId, activityId, filesArray) {
  if (submitting) throw new Error('Envio em andamento. Aguarde...');
  submitting = true;
  try {
    if (!Array.isArray(filesArray) || filesArray.length === 0) {
      throw new Error('Selecione pelo menos um arquivo.');
    }
    const token = await getAuthToken();
    const form = new FormData();
    filesArray.forEach(f => {
      form.append('activityFiles', {
        uri: f.uri,
        name: f.name || `arquivo_${Date.now()}`,
        type: f.type || 'application/octet-stream'
      });
    });
    const url = `${api.defaults.baseURL}/progress/submit/trail/${trailId}/activity/${activityId}`;
    const resp = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }, // sem Content-Type!
      body: form
    });
    const bodyText = await resp.text();
    if (!resp.ok) {
      // Body pode conter mensagem de limite ou erro
      throw new Error(bodyText || `Falha no envio (status ${resp.status}).`);
    }
    return { status: resp.status, message: bodyText || 'Atividade enviada.' };
  } catch (e) {
    throw new Error(normalizeError(e));
  } finally {
    submitting = false;
  }
}

// Helper para verificar se usuário possui progresso antes de submeter
export async function ensureProgressForActivity(trailId, activityId, trailPassword) {
  try {
    const progress = await readProgress(trailId); // pode lançar
    const list = progress?.progressList || [];
    const exists = list.some(p => Number(p.activityId) === Number(activityId));
    if (exists) return list;
    // tenta join se não existe
    const joined = await joinTrail(trailId, trailPassword);
    return joined;
  } catch (e) {
    throw e; // já normalizado
  }
}

// Export default com agrupamento
export default {
  joinTrail,
  readProgress,
  readUnlocked,
  getFlags,
  submitActivity,
  ensureProgressForActivity,
  formatFlagTimer
};

// Exemplo de uso (referência):
// import progressService from '../services/progressService';
// const flags = await progressService.getFlags();
// const timerFmt = progressService.formatFlagTimer(flags.flagGenerateTimer);
// const join = await progressService.joinTrail(trailId, senha);
// await progressService.submitActivity(trailId, activityId, [ { uri, name, type } ]);