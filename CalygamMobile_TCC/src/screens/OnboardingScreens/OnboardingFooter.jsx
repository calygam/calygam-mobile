import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import OnboardingScreensSlides from "../../../OnboardingScreensSlides";


const { width } = Dimensions.get("window");

export default function OnboardingFooter({ scrollX, OnboardingScreensSlides, currentIndex, scrollToNext }) {

    return (
        <View style={styles.footer}>
            {/* Bolinhas de progresso */}
            <View style={styles.dotsContainer}>
                {OnboardingScreensSlides.map((_, i) => {
                    // interpolando a largura (vai de pequeno -> grande -> pequeno)
                    const widthAnim = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [10, 60, 15], // largura mínima -> máxima -> mínima
                        extrapolate: "clamp",
                    });

                    // interpolando a cor/opacity
                    const opacity = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: "clamp",
                    });

                    return (
                        <Animated.View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    width: widthAnim, // largura animada
                                    opacity,
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {/* Botão */}
            <TouchableOpacity style={styles.button} onPress={scrollToNext}>
                <Text style={styles.buttonText}>
                    {currentIndex === OnboardingScreensSlides.length - 1 ? "Começar" : "Próximo"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: "row", // coloca dots e botão lado a lado
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 40,
        gap: 50
    },
    dotsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 20,   // bolinha mais "comprida"
        height: 8,
        borderRadius: 5,
        backgroundColor: "#6C63FF",
        marginHorizontal: 5,
    },
    button: {
        backgroundColor: "#6C63FF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});
