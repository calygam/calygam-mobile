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

    if (type === 'trail') {
        return (
            <View style={styles.trailWrap}>
                {Array.from({ length: count }).map((_, i) => (
                    <View key={i} style={styles.trailCard}>
                        <Shimmer style={styles.trailImage} />
                        <View style={styles.trailContent}>
                            <Shimmer style={styles.trailTitle} />
                            <Shimmer style={styles.trailDescription1} />
                            <Shimmer style={styles.trailDescription2} />
                            <View style={styles.trailMeta}>
                                <Shimmer style={styles.trailMetaItem} />
                                <Shimmer style={styles.trailMetaItem} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    if (type === 'library') {
        return (
            <View style={styles.libraryWrap}>
                {Array.from({ length: count }).map((_, i) => (
                    <View key={i} style={styles.libraryItem}>
                        <Shimmer style={styles.libraryThumbnail} />
                        <View style={styles.libraryContent}>
                            <Shimmer style={styles.libraryTitle} />
                            <Shimmer style={styles.librarySubtitle} />
                            <View style={styles.libraryMeta}>
                                <Shimmer style={styles.libraryBadge} />
                                <Shimmer style={styles.libraryBadge} />
                            </View>
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
    // Trail skeleton styles
    trailWrap: { width: '100%', paddingHorizontal: 20 },
    trailCard: { backgroundColor: '#1E3D35', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
    trailImage: { width: '100%', height: 180 },
    trailContent: { padding: 16 },
    trailTitle: { width: '70%', height: 20, borderRadius: 8, marginBottom: 12 },
    trailDescription1: { width: '100%', height: 14, borderRadius: 6, marginBottom: 6 },
    trailDescription2: { width: '85%', height: 14, borderRadius: 6, marginBottom: 12 },
    trailMeta: { flexDirection: 'row', gap: 16 },
    trailMetaItem: { width: 80, height: 14, borderRadius: 6 },
    // Library skeleton styles
    libraryWrap: { width: '100%', paddingHorizontal: 20 },
    libraryItem: { flexDirection: 'row', backgroundColor: '#1E3D35', borderRadius: 12, marginBottom: 16, padding: 12, alignItems: 'center' },
    libraryThumbnail: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
    libraryContent: { flex: 1 },
    libraryTitle: { width: '70%', height: 18, borderRadius: 8, marginBottom: 8 },
    librarySubtitle: { width: '50%', height: 14, borderRadius: 6, marginBottom: 8 },
    libraryMeta: { flexDirection: 'row', gap: 8 },
    libraryBadge: { width: 60, height: 20, borderRadius: 10 },
});