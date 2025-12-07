import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder, { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const Shimmer = createShimmerPlaceholder(LinearGradient);
const { width } = Dimensions.get('window');

/**
 * Skeleton para biblioteca de cursos/trilhas
 * Formato baseado no CardsTrilhas real
 */
export default function SkeletonLibrary({ count = 6 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cardContainer}>
          <View style={styles.boxCard}>
            {/* Header com ícone e título */}
            <View style={styles.headerRow}>
              <View style={styles.iconRow}>
                <Shimmer style={styles.fotoTrilha} />
                <Shimmer style={styles.title} />
              </View>
              <Shimmer style={styles.badge} />
            </View>
            
            {/* Professor */}
            <View style={styles.professorRow}>
              <Shimmer style={styles.professorAvatar} />
              <Shimmer style={styles.professorName} />
            </View>
            
            {/* Informações */}
            <View style={styles.infoRow}>
              <Shimmer style={styles.vagasText} />
              <Shimmer style={styles.explorarButton} />
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
    alignItems: 'center',
    gap: 25,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    backgroundColor: 'rgba(90, 24, 154, 0.4)',
    borderWidth: 2,
    borderColor: '#5A189A',
    width: width * 0.9,
    height: 'auto',
    borderRadius: 25,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingTop: 16,
    paddingLeft: 14,
    paddingRight: 14,
  },
  boxCard: {
    width: '100%',
    height: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    justifyContent: 'space-between',
    width: '100%',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  fotoTrilha: {
    width: 50,
    height: 50,
    backgroundColor: '#CE82FF33',
    borderRadius: 15,
  },
  title: {
    width: '60%',
    height: 15,
    borderRadius: 8,
    flex: 1,
  },
  badge: {
    width: 70,
    height: 28,
    borderRadius: 15,
  },
  professorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  professorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  professorName: {
    width: 120,
    height: 13,
    borderRadius: 6,
  },
  infoRow: {
    width: '100%',
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
  },
  vagasText: {
    width: 140,
    height: 13,
    borderRadius: 6,
  },
  explorarButton: {
    width: 90,
    height: 20,
    borderRadius: 6,
  },
});
