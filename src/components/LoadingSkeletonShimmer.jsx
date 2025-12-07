// components/LoadingSkeletonShimmer.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ShimmerPlaceHolder, { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

const Shimmer = createShimmerPlaceholder(LinearGradient);

export default function LoadingSkeletonShimmer({ type = 'cards', count = 4 }) {
    if (type === 'cards') {
        return (
            <View style={styles.cardsWrap}>
                {Array.from({ length: count }).map((_, i) => (
                    <View key={i} style={styles.cardPets}>
                        <Shimmer style={styles.cardImage} />
                        <View style={styles.cardTextPreco}>
                            <Shimmer style={styles.cardNome} />
                            <View style={styles.cardPrecoContainer}>
                                <Shimmer style={styles.cardIconCoin} />
                                <Shimmer style={styles.cardPreco} />
                            </View>
                        </View>
                        <Shimmer style={styles.cardBotao} />
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
                    <View key={i} style={styles.libraryCardContainer}>
                        <View style={styles.libraryBoxCard}>
                            {/* Header com ícone e título */}
                            <View style={styles.libraryHeaderRow}>
                                <View style={styles.libraryIconRow}>
                                    <Shimmer style={styles.libraryFotoTrilha} />
                                    <Shimmer style={styles.libraryTitle} />
                                </View>
                                <Shimmer style={styles.libraryBadge} />
                            </View>
                            
                            {/* Professor */}
                            <View style={styles.libraryProfessorRow}>
                                <Shimmer style={styles.libraryProfessorAvatar} />
                                <Shimmer style={styles.libraryProfessorName} />
                            </View>
                            
                            {/* Informações */}
                            <View style={styles.libraryInfoRow}>
                                <Shimmer style={styles.libraryVagasText} />
                                <Shimmer style={styles.libraryExplorarButton} />
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
    // Cards skeleton - formato baseado em CardPets
    cardsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 15, alignItems: "center", justifyContent: "center", width: '100%', paddingVertical: 15 },
    cardPets: { backgroundColor: '#FFF', width: 150, height: 'auto', justifyContent: 'center', alignItems: 'center', borderRadius: 15, gap: 12, paddingBottom: 10 },
    cardImage: { width: 150, height: 100, borderRadius: 15 },
    cardTextPreco: { width: '100%', paddingLeft: 10 },
    cardNome: { width: 120, height: 16, borderRadius: 8, marginBottom: 5 },
    cardPrecoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 10 },
    cardIconCoin: { width: 24, height: 24, borderRadius: 12 },
    cardPreco: { width: 50, height: 15, borderRadius: 6 },
    cardBotao: { backgroundColor: '#8A38F5', width: 130, height: 40, borderRadius: 10 },
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
    // Library skeleton styles - formato baseado em CardsTrilhas
    libraryWrap: { width: '100%', alignItems: 'center', gap: 25, paddingTop: 20, paddingBottom: 100 },
    libraryCardContainer: { backgroundColor: 'rgba(90, 24, 154, 0.4)', borderWidth: 2, borderColor: '#5A189A', width: '90%', height: 'auto', borderRadius: 25, justifyContent: 'flex-end', paddingBottom: 16, paddingTop: 16, paddingLeft: 14, paddingRight: 14 },
    libraryBoxCard: { width: '100%', height: 'auto', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15 },
    libraryHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 15, justifyContent: 'space-between', width: '100%' },
    libraryIconRow: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
    libraryFotoTrilha: { width: 50, height: 50, backgroundColor: '#CE82FF33', borderRadius: 15 },
    libraryTitle: { width: '60%', height: 15, borderRadius: 8, flex: 1 },
    libraryBadge: { width: 70, height: 28, borderRadius: 15 },
    libraryProfessorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    libraryProfessorAvatar: { width: 30, height: 30, borderRadius: 15 },
    libraryProfessorName: { width: 120, height: 13, borderRadius: 6 },
    libraryInfoRow: { width: '100%', height: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12 },
    libraryVagasText: { width: 140, height: 13, borderRadius: 6 },
    libraryExplorarButton: { width: 90, height: 20, borderRadius: 6 },
});