import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { computeRankProgress } from '../utils/rankUtils';
import { RANK_ICON_BY_BASE } from '../constants/ranks';

// Recebe xp e rankName (do backend) para garantir sincronização.
export default function RankBadge({ xp = 0, rankName }) {
  const { current, next, progress, nextPoints, currentPoints } = computeRankProgress(xp);

  // Se rankName vier do back e divergir do cálculo local, priorizamos o back.
  const displayRank = rankName || current.name;
  const base = current.base;
  const IconComponent = RANK_ICON_BY_BASE[base];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {IconComponent && (
          <IconComponent width={48} height={48} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.rankText}>{displayRank}</Text>
          {next ? (
            <Text style={styles.xpText}>{xp} / {nextPoints} XP</Text>
          ) : (
            <Text style={styles.xpText}>{xp} XP (Máximo)</Text>
          )}
        </View>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      {next && (
        <Text style={styles.nextText}>Próximo: {next.name} em {nextPoints} XP</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E3D35',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    gap: 8,
    borderWidth: 2,
    borderColor: '#ffffff33'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
  },
  rankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  xpText: {
    color: '#B7B7B7',
    fontSize: 12
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#0d2420',
    borderRadius: 8,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6C63FF'
  },
  nextText: {
    color: '#928cffff',
    fontSize: 12,
    marginTop: 4
  }
});
