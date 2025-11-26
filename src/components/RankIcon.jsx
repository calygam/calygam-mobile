import React from 'react';
import { computeRankProgress } from '../utils/rankUtils';
import { RANK_ICON_BY_BASE } from '../constants/ranks';

/**
 * Componente simples que renderiza apenas o ícone do rank do usuário.
 * Props:
 *  - xp: pontos de experiência (usado para calcular o rank atual)
 *  - rankName: nome do rank vindo do backend (opcional, tem prioridade sobre cálculo)
 *  - width: largura do ícone (padrão 48)
 *  - height: altura do ícone (padrão 48)
 */
export default function RankIcon({ xp = 0, rankName, width = 48, height = 48 }) {
  const { current } = computeRankProgress(xp);
  
  // Se rankName vier do backend, usa ele; senão usa o calculado
  const displayRank = rankName || current.name;
  const base = current.base;
  
  const IconComponent = RANK_ICON_BY_BASE[base];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent width={width} height={height} />;
}
