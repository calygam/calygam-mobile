import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/*
  BaseAlertModal
  Props:
    visible: boolean
    type: 'error' | 'warning' | 'success'
    title: string
    message: string
    confirmText?: string
    onConfirm?: () => void
    onClose?: () => void (close X)
    disableAutoHide?: boolean (se querer manter após confirmar)

  Uso:
    <BaseAlertModal
       visible={show}
       type="error"
       title="Título do Erro!"
       message="Descrição do erro."
       onConfirm={() => { setShow(false); }}
       onClose={() => setShow(false)}
    />
*/

const THEMES = {
  error: {
    cardBg: '#0D141C',
    accent: '#FF4D41',
    accentBg: '#FFFFFF',
    buttonBg: '#E53935',
    buttonText: '#FFFFFF',
  },
  warning: {
    cardBg: '#0D141C',
    accent: '#FFC107',
    accentBg: '#FFF4DB',
    buttonBg: '#6C63FF',
    buttonText: '#FFFFFF',
  },
  success: {
    cardBg: '#021713',
    accent: '#3DDC84',
    accentBg: '#E6FFF3',
    buttonBg: '#6C63FF',
    buttonText: '#FFFFFF',
  }
};

const ICONS = {
  error: () => (
    <Svg width={38} height={38} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={24} r={23} stroke="#FF4D41" strokeWidth={2} />
      <Path d="M24 13v14" stroke="#FF4D41" strokeWidth={3} strokeLinecap="round" />
      <Circle cx={24} cy={33} r={2.2} fill="#FF4D41" />
    </Svg>
  ),
  warning: () => (
    <Svg width={38} height={38} viewBox="0 0 48 48" fill="none">
      <Path d="M23.1 7.6c.6-1.1 2.2-1.1 2.8 0l14.6 27.4c.6 1.1-.2 2.4-1.4 2.4H9.9c-1.2 0-2-1.3-1.4-2.4L23.1 7.6z" stroke="#D89200" strokeWidth={2} fill="#FFC107" />
      <Path d="M24 18v10" stroke="#4F3600" strokeWidth={3} strokeLinecap="round" />
      <Circle cx={24} cy={31} r={2.2} fill="#4F3600" />
    </Svg>
  ),
  success: () => (
    <Svg width={38} height={38} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={24} r={23} stroke="#3DDC84" strokeWidth={2} />
      <Path d="M16 25l6 6 11-13" stroke="#3DDC84" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
};

export default function BaseAlertModal({
  visible,
  type = 'error',
  title = '',
  message = '',
  confirmText,
  onConfirm,
  onClose,
  disableAutoHide = false,
}) {
  const theme = THEMES[type] || THEMES.error;
  const Icon = ICONS[type] || ICONS.error;

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.85, duration: 160, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    console.log('[BaseAlertModal] Confirm pressed type=', type, 'title=', title);
    try {
      if (onConfirm) {
        const maybePromise = onConfirm();
        // Se for promise e disableAutoHide, aguarda término antes de fechar automático
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.finally(() => {
            if (!disableAutoHide && onClose) onClose();
          });
          return;
        }
      }
    } catch (e) {
      console.log('[BaseAlertModal] Erro dentro onConfirm:', e);
    }
    if (!disableAutoHide && onClose) onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}/>
      <View style={styles.centerWrapper} pointerEvents={visible ? 'auto' : 'none'}>
        <Animated.View style={[styles.card, { backgroundColor: theme.cardBg, transform: [{ scale }] }]}>          
          <View style={styles.closeRow}>            
            <View style={[styles.iconCircle, { backgroundColor: theme.accentBg }]}>              
              <Icon />            
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>              
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.buttonBg }]} onPress={handleConfirm}>
            <Text style={[styles.confirmText, { color: theme.buttonText }]}>{confirmText || (type === 'success' ? 'Confirmar' : 'OK')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)'
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 22,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 22,
    color: '#A8B1BA'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#C7CDD2',
    marginBottom: 22,
  },
  confirmBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600'
  }
});
