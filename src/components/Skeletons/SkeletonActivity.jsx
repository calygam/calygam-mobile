import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);

/**
 * Skeleton para página de atividade
 */
export default function SkeletonActivity() {
  return (
    <View style={styles.container}>
      <Shimmer style={styles.header} />
      <Shimmer style={styles.descriptionBox} />
      <Shimmer style={styles.fileBox} />
      <View style={styles.actionsRow}>
        <Shimmer style={styles.actionButton} />
        <Shimmer style={styles.actionButton} />
      </View>
      <View style={styles.commentsSection}>
        <Shimmer style={styles.commentsTitle} />
        <View style={styles.commentSkeletons}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.commentItem}>
              <Shimmer style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <Shimmer style={styles.commentUserName} />
                <Shimmer style={styles.commentText} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 55,
    backgroundColor: '#021713',
  },
  header: {
    width: '60%',
    height: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  descriptionBox: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 25,
  },
  fileBox: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 25,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 30,
  },
  actionButton: {
    width: 120,
    height: 40,
    borderRadius: 10,
  },
  commentsSection: {
    marginTop: 30,
  },
  commentsTitle: {
    width: 180,
    height: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  commentSkeletons: {
    gap: 16,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    width: 120,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentText: {
    width: '90%',
    height: 14,
    borderRadius: 6,
    marginBottom: 4,
  },
});
