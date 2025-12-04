import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);

/**
 * Skeleton para comentários
 */
export default function SkeletonComment({ count = 3 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.commentItem}>
          <View style={styles.commentHeaderRow}>
          <View style={styles.commentHeader}>
            <Shimmer style={styles.avatar} />
            <View style={styles.commentContent}>
              <Shimmer style={styles.userName} />
              <Shimmer style={styles.commentText1} />
              <Shimmer style={styles.commentText2} />
              <View style={styles.actions}>
                <Shimmer style={styles.actionButton} />
                <Shimmer style={styles.actionButton} />
                </View>
              </View>
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
    paddingHorizontal: 4,
  },
  commentItem: {
    marginBottom: 20,
    width: '100%',
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#1E3D35',
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    width: 120,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentText1: {
    width: '90%',
    height: 14,
    borderRadius: 6,
    marginBottom: 6,
  },
  commentText2: {
    width: '70%',
    height: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  actionButton: {
    width: 60,
    height: 14,
    borderRadius: 6,
  },
});
