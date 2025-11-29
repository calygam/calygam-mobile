import { View, Text, Modal, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import IconCoin from "../../../assets/svg/IconsInterface/coin.svg";

export default function ModalDetalhesPet({ visible, onClose, item, onComprar }) {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Imagem do Pet */}
            <Image source={item.imagem} style={styles.imagem} resizeMode="cover" />

            {/* Nome e Preço */}
            <View style={styles.header}>
              <Text style={styles.nome}>{item.nome}</Text>
              <View style={styles.precoContainer}>
                <IconCoin width={28} height={28} />
                <Text style={styles.preco}>{item.preco}</Text>
              </View>
            </View>

            {/* Tipo */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.tipo === 'PET' ? '🐾 Pet' : '🎨 Skin'}</Text>
            </View>

            {/* Boosts (apenas se for PET) */}
            {item.tipo === 'PET' && (
              <View style={styles.boostsContainer}>
                <Text style={styles.subtitle}>💪 Boosts</Text>
                {item.petBoostMoney !== undefined && (
                  <View style={styles.boostRow}>
                    <Text style={styles.boostLabel}>💰 Moedas:</Text>
                    <Text style={styles.boostValue}>x{item.petBoostMoney}</Text>
                  </View>
                )}
                {item.petBoostXp !== undefined && (
                  <View style={styles.boostRow}>
                    <Text style={styles.boostLabel}>⭐ XP:</Text>
                    <Text style={styles.boostValue}>x{item.petBoostXp}</Text>
                  </View>
                )}
                {item.petBoostFood !== undefined && (
                  <View style={styles.boostRow}>
                    <Text style={styles.boostLabel}>🍖 Comida:</Text>
                    <Text style={styles.boostValue}>x{item.petBoostFood}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Bônus de Skin (apenas se for SKIN) */}
            {item.tipo === 'SKIN' && (
              <View style={styles.boostsContainer}>
                <Text style={styles.subtitle}>✨ Bônus</Text>
                {item.petOutfitPlusMoney !== undefined && item.petOutfitPlusMoney > 0 && (
                  <View style={styles.boostRow}>
                    <Text style={styles.boostLabel}>💰 Moedas:</Text>
                    <Text style={styles.boostValue}>+{item.petOutfitPlusMoney}</Text>
                  </View>
                )}
                {item.petOutfitPlusXp !== undefined && item.petOutfitPlusXp > 0 && (
                  <View style={styles.boostRow}>
                    <Text style={styles.boostLabel}>⭐ XP:</Text>
                    <Text style={styles.boostValue}>+{item.petOutfitPlusXp}</Text>
                  </View>
                )}
                {item.petOutfitPlusFood !== undefined && item.petOutfitPlusFood > 0 && (
                  <View style={styles.boostRow}>
                    <Text style={styles.boostLabel}>🍖 Comida:</Text>
                    <Text style={styles.boostValue}>+{item.petOutfitPlusFood}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Energia (se disponível) */}
            {item.petMaxEnergy && (
              <View style={styles.energiaContainer}>
                <Text style={styles.subtitle}>⚡ Energia</Text>
                <Text style={styles.energiaInfo}>
                  Máxima: {item.petMaxEnergy} | Padrão: {item.petDefaultEnergy || item.petMaxEnergy}
                </Text>
              </View>
            )}

            {/* Botões */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
                <Text style={styles.btnCancelarText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnComprar} onPress={() => onComprar(item)}>
                <Text style={styles.btnComprarText}>Comprar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
      backgroundColor: '#021713',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  imagem: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    marginBottom: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  nome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  precoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preco: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 15,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffffa7',
    marginBottom: 10,
  },
  boostsContainer: {
    backgroundColor: '#0D141C',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#6C63FF81',
  },
  boostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  boostLabel: {
    fontSize: 16,
    color: '#ffffffa7',
  },
  boostValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  energiaContainer: {
    backgroundColor: '#0D141C',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#6C63FF81',
  },
  energiaInfo: {
    fontSize: 14,
    color: '#ffffffa7',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btnCancelar: {
    flex: 1,
    // backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  btnCancelarText: {
    color: '#6C63FF',
    fontWeight: '600',
    fontSize: 16,
  },
  btnComprar: {
    flex: 1,
    backgroundColor: '#6C63FF',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnComprarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
