import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);

/**
 * Skeleton para tela Trail - copia exatamente o layout real
 */
export default function SkeletonTrail({ count = 1 }) {
  return (
    <View style={styles.container}>
      {/* InfoContent */}
      <View style={styles.infoContent}>
        <Shimmer style={styles.modalPlaceholder} />
        <View style={styles.infoTextContainer}>
          <Shimmer style={styles.infoTitle} />
          <Shimmer style={styles.infoSubtitle} />
        </View>
      </View>

      {/* PainelContent */}
      <View style={styles.painelContent}>
        <View style={styles.painelHeader}>
          <Shimmer style={styles.painelTitle} />
          <Shimmer style={styles.coinsContainer} />
        </View>
        <Shimmer style={styles.rankBadge} />
        <Shimmer style={styles.progressText} />
      </View>

      {/* FlagsBox */}
      <View style={styles.flagsBox}>
        <View style={styles.flagsHeader}>
          <Shimmer style={styles.flagsLabel} />
          <Shimmer style={styles.flagsValue} />
        </View>
        <View style={styles.heartsContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} style={styles.heart} />
          ))}
        </View>
      </View>

      {/* StatusContainer */}
      <View style={styles.statusContainer}>
        <Shimmer style={styles.statusBadge} />
        <Shimmer style={styles.recompensaBadge} />
      </View>

      {/* Bolinhas de atividades */}
      <View style={styles.activitiesContainer}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={[styles.activityBubble, i % 2 === 1 && styles.activityBubbleRight]}>
            <Shimmer style={styles.bubble} />
            <Shimmer style={styles.activityName} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#021713',
    gap: 25,
    paddingTop: 50,
    paddingBottom: 80,
  },
  infoContent: {
    width: '95%',
    height: 'auto',
    backgroundColor: '#1E3D35',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  modalPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexShrink: 1,
  },
  infoTitle: {
    width: 200,
    height: 16,
    borderRadius: 8,
  },
  infoSubtitle: {
    width: 150,
    height: 14,
    borderRadius: 6,
  },
  painelContent: {
    width: '95%',
    height: 'auto',
    backgroundColor: '#1E3D35',
    borderRadius: 20,
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  painelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 11,
  },
  painelTitle: {
    width: 150,
    height: 16,
    borderRadius: 8,
  },
  coinsContainer: {
    width: 100,
    height: 14,
    borderRadius: 6,
  },
  rankBadge: {
    width: '100%',
    height: 65,
    borderRadius: 12,
    marginBottom: 8,
  },
  progressText: {
    width: 200,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  flagsBox: {
    width: '95%',
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    padding: 12,
  },
  flagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  flagsLabel: {
    width: 100,
    height: 12,
    borderRadius: 6,
  },
  flagsValue: {
    width: 30,
    height: 14,
    borderRadius: 6,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexWrap: 'wrap',
  },
  heart: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  statusContainer: {
    width: '90%',
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    width: 80,
    height: 40,
    borderRadius: 40,
  },
  recompensaBadge: {
    width: 180,
    height: 40,
    borderRadius: 40,
  },
  activitiesContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  activityBubble: {
    marginVertical: 25,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  activityBubbleRight: {
    alignSelf: 'flex-end',
  },
  bubble: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  activityName: {
    width: 100,
    height: 13,
    borderRadius: 6,
    marginTop: 8,
  },
});
