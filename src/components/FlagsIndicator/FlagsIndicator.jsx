import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import progressService from '../../services/progressService';

// Componente que exibe quantidade de flags, countdown e anima animação de estouro quando flags diminuem
// Props opcionais:
//  trailId?: para forçar refresh quando voltar da atividade
//  autoRefresh?: boolean (default true) - atualiza ao montar e a cada refreshFlags() externo
//  size?: número (dimensão do Lottie)
export default function FlagsIndicator({ trailId, autoRefresh = true, size = 80 }) {
  const animationRef = useRef(null);
  const [flags, setFlags] = useState(null); // { flagsQtd, flagGenerateTimer }
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [prevFlagsQtd, setPrevFlagsQtd] = useState(null);

  // Countdown
  useEffect(() => {
    let interval = null;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [timerSeconds]);

  const fetchFlags = async () => {
    try {
      const data = await progressService.getFlags();
      setFlags(data);
      setTimerSeconds(data?.flagGenerateTimer || 0);
      if (prevFlagsQtd != null && data?.flagsQtd < prevFlagsQtd) {
        // Flags diminuíram -> dispara animação de estouro
        animationRef.current?.play();
      }
      setPrevFlagsQtd(data?.flagsQtd);
    } catch (e) {
      console.log('FlagsIndicator: erro ao buscar flags', e);
    }
  };

  // Auto refresh on mount
  useEffect(() => {
    if (autoRefresh) fetchFlags();
  }, [trailId]);

  // Expor método imperativo opcional via ref? (não necessário agora)

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.label}>Flags</Text>
          <Text style={styles.value}>{flags?.flagsQtd ?? '-'}</Text>
          {timerSeconds > 0 && (
            <Text style={styles.timer}>+1 em {progressService.formatFlagTimer(timerSeconds)}</Text>
          )}
        </View>
        <View style={styles.animationWrapper}>
          <LottieView
            ref={animationRef}
            source={require('../../../assets/SLa.json')} // Ajuste de case para corresponder ao arquivo físico
            style={{ width: size, height: size }}
            loop={false}
            autoPlay={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    backgroundColor: '#1E3D35',
    padding: 12,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#6C63FF55'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textBlock: {
    flexDirection: 'column',
    gap: 4
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  value: {
    color: '#6C63FF',
    fontSize: 28,
    fontWeight: 'bold'
  },
  timer: {
    color: '#B7B7B7',
    fontSize: 12
  },
  animationWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
