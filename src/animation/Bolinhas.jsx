import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { View, Button } from 'react-native';
import '../../assets/SLa.json';

export default function GamifiedActivity() {
  const animationRef = useRef(null);

  const handleSendActivity = () => {
    // dispara a animação
    animationRef.current.play();
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <LottieView
        ref={animationRef}
        source={require('../../assets/SLa.json')}
        style={{ width: 150, height: 150 }}
        loop={false}
      />
      <Button title="Enviar Atividade" onPress={handleSendActivity} />
    </View>
  );
}
