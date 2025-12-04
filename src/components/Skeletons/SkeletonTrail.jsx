import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);

/**
 * Skeleton para cards de trilhas
 */
export default function SkeletonTrail({ count = 4 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.trailCard}>
          <Shimmer style={styles.image} />
          <View style={styles.content}>
            <Shimmer style={styles.title} />
            <Shimmer style={styles.description1} />
            <Shimmer style={styles.description2} />
            <View style={styles.meta}>
              <Shimmer style={styles.metaItem} />
              <Shimmer style={styles.metaItem} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  trailCard: {
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    width: '70%',
    height: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  description1: {
    width: '100%',
    height: 14,
    borderRadius: 6,
    marginBottom: 6,
  },
  description2: {
    width: '85%',
    height: 14,
    borderRadius: 6,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    width: 80,
    height: 14,
    borderRadius: 6,
  },
});
