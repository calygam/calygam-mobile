import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useState, useRef} from 'react'
import LottieView from 'lottie-react-native';

// Mini playground para testar a lógica de “gastar vidas” animando o último coração disponível.
export default function AnimationLimitAtividade() {
  const MAX_LIVES = 5;
  const [lives, setLives] = useState(MAX_LIVES);
  const [visibleLives, setVisibleLives] = useState(MAX_LIVES);
  const heartRefs = useRef({});

  const spendLife = () => {
    if (lives <= 0) {
      // Reinicia para testar novamente
      setLives(MAX_LIVES);
      setVisibleLives(MAX_LIVES);
      return;
    }

    const nextLives = lives - 1;
    const indexToAnimate = Math.max(0, lives - 1);
    const ref = heartRefs.current[indexToAnimate];
    if (ref?.current) {
      ref.current.play();
    }

    // Após a animação, reduz a quantidade renderizada
    setTimeout(() => {
      setVisibleLives(nextLives);
      setLives(nextLives);
    }, 700);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vidas: {visibleLives}/{MAX_LIVES}</Text>
      <View style={styles.heartsRow}>
        {Array.from({ length: visibleLives }).map((_, index) => (
          <LottieView
            key={index}
            source={require('../../assets/like.json')}
            autoPlay={false}
            loop={false}
            style={{ width: 60, height: 60 }}
            ref={(ref) => {
              if (!heartRefs.current[index]) {
                heartRefs.current[index] = { current: null };
              }
              heartRefs.current[index].current = ref;
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={spendLife}>
        <Text style={styles.buttonText}>{lives > 0 ? 'Gastar vida (explode último)' : 'Reiniciar vidas'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#021713',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
})