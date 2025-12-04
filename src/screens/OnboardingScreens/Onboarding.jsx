import { View, Text, FlatList, StyleSheet, StatusBar, Animated, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useRef } from 'react'
import OnboardingScreensSlides from '../../../OnboardingScreensSlides'
import OnboardingItem from './OnboardingItem'
import OnboardingFooter from './OnboardingFooter'
import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pegamos a largura da tela do celular
const { width } = Dimensions.get("window");

export default function Onboarding() {

    const navigation = useNavigation();

    // Estado que guarda em qual slide estamos
    const [currentIndex, setCurrentIndex] = useState(0);

    // Animação para os pontinhos (dots)
    const scrollX = useRef(new Animated.Value(0)).current;

    // Referência da FlatList para controlar os slides
    const slidesRef = useRef(null);

    // Função chamada quando a tela visível muda
    const viewableItemsChanged = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;

    // Configuração que define quando considerar um item "visível"
    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    // Função para ir para o próximo slide ou terminar o onboarding
    const scrollToNext = async () => {
        if (currentIndex < OnboardingScreensSlides.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Marcar que o usuário já viu o onboarding
            try {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            } catch (error) {
                console.error('Erro ao salvar hasSeenOnboarding:', error);
            }
            // Aqui vamos manda o usuário pra tela de Login
            navigation.navigate('Login')
        }
    };

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={OnboardingScreensSlides} // Lista os Slides
                horizontal // Faz a Lista ficar na Horizontal
                pagingEnabled // Faz pula de pagina em pagina
                showsHorizontalScrollIndicator={false} // Esconde a barrinha de Rolagem
                renderItem={({ item }) => <OnboardingItem item={item} />}  // como desenhar cada slide
                keyExtractor={(item) => item.id} // pega o id de cada slide como chave única
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
            />
            <OnboardingFooter
                scrollX={scrollX}
                OnboardingScreensSlides={OnboardingScreensSlides}
                currentIndex={currentIndex}
                scrollToNext={scrollToNext}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#021713',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
