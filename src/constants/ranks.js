// Lista de ranks copiada do enum do backend.
// Cada objeto tem o mínimo de XP para atingir aquele rank.
// Ao atingir exatamente 'points', o usuário já sobe (regra xp >= points).
export const RANKS = [
  { points: 0, name: 'BRONZE-I', base: 'BRONZE' },
  { points: 500, name: 'BRONZE-II', base: 'BRONZE' },
  { points: 1000, name: 'BRONZE-III', base: 'BRONZE' },

  { points: 1500, name: 'SILVER-I', base: 'SILVER' },
  { points: 2000, name: 'SILVER-II', base: 'SILVER' },
  { points: 2500, name: 'SILVER-III', base: 'SILVER' },

  { points: 4500, name: 'GOLD-I', base: 'GOLD' },
  { points: 5000, name: 'GOLD-II', base: 'GOLD' },
  { points: 5500, name: 'GOLD-III', base: 'GOLD' },

  { points: 6000, name: 'PLATINUM-I', base: 'PLATINUM' },
  { points: 6500, name: 'PLATINUM-II', base: 'PLATINUM' },
  { points: 7000, name: 'PLATINUM-III', base: 'PLATINUM' },

  { points: 7500, name: 'DIAMOND-I', base: 'DIAMOND' },
  { points: 8000, name: 'DIAMOND-II', base: 'DIAMOND' },
  { points: 8500, name: 'DIAMOND-III', base: 'DIAMOND' },

  { points: 10000, name: 'ASCENDENT-I', base: 'ASCENDENT' },
  { points: 12000, name: 'ASCENDENT-II', base: 'ASCENDENT' },
  { points: 15000, name: 'ASCENDENT-III', base: 'ASCENDENT' }
];

// Mapeamento rápido para ícones (nomes de arquivos em assets/svg/IconsRanks)
// Ajuste se os nomes dos arquivos mudarem.
// IMPORTANTE: para SVG em React Native (com react-native-svg) devemos importar como componente.
// Se estes caminhos com espaços causarem erro no Metro bundler, considere renomear os arquivos para nomes sem espaços
// e atualizar estes imports.
import BronzeIcon from '../../assets/svg/IconsRanks/RANK BADGES-Bronze.svg';
import SilverIcon from '../../assets/svg/IconsRanks/RANK BADGES-Silver.svg';
import GoldIcon from '../../assets/svg/IconsRanks/RANK BADGES-Gold.svg';
import PlatinumIcon from '../../assets/svg/IconsRanks/RANK BADGES-Platim.svg';
import DiamondIcon from '../../assets/svg/IconsRanks/RANK BADGES-Diamond.svg';
import AscendentIcon from '../../assets/svg/IconsRanks/RANK BADGES-Ascentent.svg';

export const RANK_ICON_BY_BASE = {
  BRONZE: BronzeIcon,
  SILVER: SilverIcon,
  GOLD: GoldIcon,
  PLATINUM: PlatinumIcon,
  DIAMOND: DiamondIcon,
  ASCENDENT: AscendentIcon,
};
