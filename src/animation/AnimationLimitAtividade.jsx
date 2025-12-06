import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useState, useRef, useEffect} from 'react'
import { ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';

export default function Teste() {
  const animationRef = useRef(null);
  const [like, setLike] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      if (like) {
        animationRef.current?.play(0, 30);
      } else {
        animationRef.current?.play(0, 0);
      }
      firstRun.current = false;
      return;
    }

    animationRef.current?.play();
  }, [like]);

  return (
    
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setLike(!like)}>
        <LottieView 
          source={require('../../assets/like.json')}
          autoPlay={false}
          loop={false}
          style={{ width: 100, height: 100 }}
          ref={animationRef}
        />
        </TouchableOpacity>
      </View>
  
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#021713',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})