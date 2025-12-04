import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);

/**
 * Skeleton para biblioteca de cursos/trilhas
 */
export default function SkeletonLibrary({ count = 6 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.libraryItem}>
          <Shimmer style={styles.thumbnail} />
          <View style={styles.content}>
            <Shimmer style={styles.title} />
            <Shimmer style={styles.subtitle} />
            <View style={styles.meta}>
              <Shimmer style={styles.metaBadge} />
              <Shimmer style={styles.metaBadge} />
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
  libraryItem: {
    flexDirection: 'row',
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    width: '70%',
    height: 18,
    borderRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    width: '50%',
    height: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
});
