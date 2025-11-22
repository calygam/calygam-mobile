// Simple pub-sub alert service used to intercept native Alert.alert calls
let subscribers = [];

export function subscribeAlert(listener) {
  subscribers.push(listener);
  return () => {
    subscribers = subscribers.filter(l => l !== listener);
  };
}

export function pushAlert(payload) {
  subscribers.forEach(l => {
    try { l(payload); } catch (e) { console.log('[alertService] listener error', e); }
  });
}

// Heuristic type inference based on title/message
export function inferType(title = '', message = '') {
  const t = (title + ' ' + message).toLowerCase();
  if (t.includes('sucesso') || t.includes('success') || t.includes('salvo')) return 'success';
  if (t.includes('erro') || t.includes('error') || t.includes('falha')) return 'error';
  if (t.includes('aviso') || t.includes('atenção') || t.includes('warning')) return 'warning';
  return 'warning';
}
