import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);

/**
 * Skeleton para página de atividade - copia exatamente o layout real
 */
export default function SkeletonActivity() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Shimmer style={styles.backButton} />
        <Shimmer style={styles.title} />
      </View>

      {/* DescriptionBox */}
      <View style={styles.descriptionBox}>
        <Shimmer style={styles.boxTitle} />
        <Shimmer style={styles.description} />
        <View style={styles.metaRow}>
          <Shimmer style={styles.metaText} />
          <Shimmer style={styles.metaText} />
        </View>
      </View>

      {/* LimitsBox */}
      <View style={styles.limitsBox}>
        <View style={styles.limitsHeader}>
          <Shimmer style={styles.boxTitle} />
          <Shimmer style={styles.limitValue} />
        </View>
        <View style={styles.limitsSubHeader}>
          <Shimmer style={styles.boxTitle} />
          <Shimmer style={styles.limitValue} />
        </View>
      </View>

      {/* BoxTitle "Sua entrega" */}
      <Shimmer style={styles.boxTitle} />

      {/* File Box */}
      <View style={styles.box}>
        <Shimmer style={styles.uploadIcon} />
        <Shimmer style={styles.uploadText} />
      </View>

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <Shimmer style={styles.actionBtn} />
        <Shimmer style={styles.actionBtn} />
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <View style={styles.commentsHeader}>
          <Shimmer style={styles.commentsTitle} />
          <Shimmer style={styles.refreshIcon} />
        </View>
        <View style={styles.commentSkeletons}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.commentItem}>
              <Shimmer style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <Shimmer style={styles.commentUserName} />
                <Shimmer style={styles.commentText} />
                <View style={styles.commentActions}>
                  <Shimmer style={styles.actionText} />
                </View>
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
    flexGrow: 1,
    backgroundColor: '#021713',
    padding: 20,
    paddingTop: 55,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#6C63FF55',
    width: 60,
    height: 30,
  },
  title: {
    width: 150,
    height: 18,
    borderRadius: 8,
  },
  descriptionBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 35,
    width: '100%',
  },
  boxTitle: {
    width: 200,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  description: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    width: 120,
    height: 12,
    borderRadius: 6,
  },
  limitsBox: {
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  limitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  limitValue: {
    width: 40,
    height: 14,
    borderRadius: 6,
  },
  limitsSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 5,
    paddingTop: 5,
  },
  box: {
    width: '100%',
    height: 150,
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#ffffffc2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffffff',
    marginBottom: 10,
  },
  uploadText: {
    width: 180,
    height: 14,
    borderRadius: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    justifyContent: 'center',
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: 140,
    height: 40,
  },
  commentsSection: {
    marginTop: 30,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  commentsTitle: {
    width: 180,
    height: 16,
    borderRadius: 8,
  },
  refreshIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  commentSkeletons: {
    gap: 20,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#6C63FF',
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    width: 120,
    height: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  commentText: {
    width: '90%',
    height: 13,
    borderRadius: 6,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionText: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },
});
