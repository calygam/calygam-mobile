// components/LoadingSkeletonShimmer.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ShimmerPlaceHolder, { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

const Shimmer = createShimmerPlaceholder(LinearGradient);

export default function LoadingSkeletonShimmer({ type = 'cards', count = 4 }) {
    if (type === 'cards') {
        return (
            <View style={styles.wrap}>
                {Array.from({ length: count }).map((_, i) => (
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

    if (type === 'list') {
        return (
            <View style={styles.listWrap}>
                {Array.from({ length: count }).map((_, i) => (
                    <View key={i} style={styles.listItem}>
                        <Shimmer style={styles.avatar} />
                        <View style={styles.textWrap}>
                            <Shimmer style={styles.line1} />
                            <Shimmer style={styles.line2} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // Default to cards
    return (
        <View style={styles.wrap}>
            {Array.from({ length: count }).map((_, i) => (
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
    listWrap: { padding: 10 },
    listItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    textWrap: { flex: 1 },
    line1: { width: '80%', height: 16, borderRadius: 8, marginBottom: 6 },
    line2: { width: '60%', height: 14, borderRadius: 6 },
});