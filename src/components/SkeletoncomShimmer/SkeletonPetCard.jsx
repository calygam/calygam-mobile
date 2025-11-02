// components/SkeletonPetCard.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ShimmerPlaceHolder, { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

const Shimmer = createShimmerPlaceholder(LinearGradient);

export default function SkeletonPetCard() {
    return (
        <View style={styles.wrap}>
            {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.cardWrap}>
                    <Shimmer style={styles.image} />
                    <Shimmer style={styles.title} />
                    <Shimmer style={styles.price} />
                    <Shimmer style={styles.button} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, paddingTop: 10 },
    cardWrap: { width: 150, margin: 8, alignItems: "center" },
    image: { width: 150, height: 100, borderRadius: 12, marginBottom: 8 },
    title: { width: 120, height: 18, borderRadius: 8, marginBottom: 6 },
    price: { width: 80, height: 16, borderRadius: 8, marginBottom: 8 },
    button: { width: 130, height: 40, borderRadius: 10 },
});
