import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert as RNAlert } from 'react-native';
import BaseAlertModal from './BaseAlertModal';
import { subscribeAlert, pushAlert, inferType } from './alertService';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [queue, setQueue] = useState([]); // array de {type,title,message,onConfirm,confirmText}
  const [current, setCurrent] = useState(null);

  // Exibir o próximo da fila
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
    }
  }, [queue, current]);

  const closeCurrent = useCallback(() => {
    setQueue(q => q.slice(1));
    setCurrent(null);
  }, []);

  const show = useCallback((config) => {
    setQueue(q => [...q, config]);
  }, []);

  const api = {
    show,
    success: (title, message, opts={}) => show({ type: 'success', title, message, ...opts }),
    error: (title, message, opts={}) => show({ type: 'error', title, message, ...opts }),
    warning: (title, message, opts={}) => show({ type: 'warning', title, message, ...opts }),
  };

  // Interceptar Alert.alert
  useEffect(() => {
    const original = RNAlert.alert;
    RNAlert.alert = (title, message='', buttons=[], options={}) => {
      // Pegar primeiro botão como confirm
      let confirmBtn = buttons && buttons[0];
      const onConfirm = confirmBtn && confirmBtn.onPress ? () => {
        try { confirmBtn.onPress(); } catch(e) {}
        closeCurrent();
      } : closeCurrent;
      const type = inferType(title, message);
      show({ type, title: title || '', message: message || '', onConfirm, confirmText: confirmBtn?.text || undefined });
    };
    return () => { RNAlert.alert = original; };
  }, [show, closeCurrent]);

  // Assinar service (caso externo chame pushAlert manualmente)
  useEffect(() => {
    const unsub = subscribeAlert((payload) => {
      const { title, message, buttons } = payload || {};
      let confirmBtn = buttons && buttons[0];
      const onConfirm = confirmBtn && confirmBtn.onPress ? () => {
        try { confirmBtn.onPress(); } catch(e) {}
        closeCurrent();
      } : closeCurrent;
      const type = inferType(title, message);
      show({ type, title, message, onConfirm, confirmText: confirmBtn?.text || undefined });
    });
    return () => unsub();
  }, [show, closeCurrent]);

  return (
    <AlertContext.Provider value={api}>
      {children}
      {current && (
        <BaseAlertModal
          visible={!!current}
          type={current.type}
          title={current.title}
          message={current.message}
          confirmText={current.confirmText}
          onConfirm={current.onConfirm}
          onClose={closeCurrent}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert deve ser usado dentro de <AlertProvider>');
  return ctx;
}
