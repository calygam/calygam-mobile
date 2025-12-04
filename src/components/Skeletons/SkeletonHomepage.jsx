import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);

/**
 * Skeleton para Homepage - Cards de trilhas recentes
 */
export default function SkeletonHomepage({ count = 3 }) {
  return (
    <View style={styles.cardsContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.trailCard}>
          <Shimmer style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Shimmer style={styles.cardTitle} />
            <Shimmer style={styles.cardProgressBar} />
            <Shimmer style={styles.cardProgressText} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  trailCard: {
    width: 280,
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    width: '80%',
    height: 18,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  cardProgressText: {
    width: '60%',
    height: 14,
    borderRadius: 6,
  },
});
