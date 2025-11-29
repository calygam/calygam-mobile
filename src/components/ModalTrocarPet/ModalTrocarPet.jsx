import React, { useEffect, useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { fetchEquippedPet, fetchUnequippedPets, equipPet } from '../../services/petService';

/**
 * ModalTrocarPet
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - onEquipped: (pet) => void  (retorna pet equipado atualizado após sucesso)
 *  - initialSelectedPetId?: number (pré-selecionar um pet, ex: recém comprado)
 */
export default function ModalTrocarPet({ visible, onClose, onEquipped, initialSelectedPetId }) {
  const [loading, setLoading] = useState(false);
  const [equippedPet, setEquippedPet] = useState(null);
  const [pets, setPets] = useState([]); // unequipped
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [equipProcessing, setEquipProcessing] = useState(false);

  const loadPets = useCallback(async () => {
    setLoading(true);
    try {
      const petAtual = await fetchEquippedPet();
      setEquippedPet(petAtual);
      const unequipped = await fetchUnequippedPets();
      setPets(Array.isArray(unequipped) ? unequipped : []);

      // Pré-seleção: se initialSelectedPetId fornecido, tenta achar.
      if (initialSelectedPetId) {
        // Pode estar entre unequipped ou ser exatamente o equipado.
        if (petAtual && (petAtual.petId === initialSelectedPetId || petAtual.emporiumItemId === initialSelectedPetId)) {
          setSelectedPetId(petAtual.petId || initialSelectedPetId);
        } else if (unequipped?.some(p => p.petId === initialSelectedPetId || p.emporiumItemId === initialSelectedPetId)) {
          const found = unequipped.find(p => p.petId === initialSelectedPetId || p.emporiumItemId === initialSelectedPetId);
          setSelectedPetId(found.petId || initialSelectedPetId);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar pets para troca:', e);
      Alert.alert('Erro', 'Não foi possível carregar pets.');
    } finally {
      setLoading(false);
    }
  }, [initialSelectedPetId]);

  useEffect(() => {
    if (visible) {
      loadPets();
    } else {
      // Reset quando fecha
      setSelectedPetId(null);
      setEquipProcessing(false);
    }
  }, [visible, loadPets]);

  const handleSelect = (petId) => {
    setSelectedPetId(petId === selectedPetId ? null : petId);
  };

  const handleEquip = async () => {
    if (!selectedPetId) {
      Alert.alert('Selecione um pet', 'Escolha um pet para equipar.');
      return;
    }
    setEquipProcessing(true);
    try {
      const response = await equipPet(selectedPetId, 'PET');
      if (response?.responseOk) {
        // Recarrega pet equipado atualizado
        const atualizado = await fetchEquippedPet();
        if (onEquipped) onEquipped(atualizado);
        Alert.alert('Sucesso', response.responseMsg || 'Pet equipado.');
        onClose && onClose();
      } else {
        Alert.alert('Falha', response?.responseMsg || 'Não foi possível equipar.');
      }
    } catch (e) {
      const msg = e.response?.data?.responseMsg || e.response?.data?.message || 'Erro ao equipar.';
      Alert.alert('Erro', msg);
    } finally {
      setEquipProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Trocar Pet</Text>
          <Text style={styles.subtitle}>Selecione um pet para equipar</Text>

          {loading ? (
            <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
          ) : (
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {equippedPet && (
                <PetCard
                  pet={equippedPet}
                  equipped
                  selected={selectedPetId === (equippedPet.petId || equippedPet.emporiumItemId)}
                  onPress={() => handleSelect(equippedPet.petId || equippedPet.emporiumItemId)}
                />
              )}
              {pets.filter(p => {
                // Evitar duplicar o pet equipado na lista de não equipados
                const petIdCheck = p.petId || p.emporiumItemId;
                const equippedIdCheck = equippedPet?.petId || equippedPet?.emporiumItemId;
                return petIdCheck !== equippedIdCheck;
              }).map((pet) => (
                <PetCard
                  key={pet.petId || pet.emporiumItemId}
                  pet={pet}
                  selected={selectedPetId === (pet.petId || pet.emporiumItemId)}
                  onPress={() => handleSelect(pet.petId || pet.emporiumItemId)}
                />
              ))}
              {(!equippedPet && pets.length === 0) && (
                <Text style={styles.empty}>Você não possui pets para equipar.</Text>
              )}
            </ScrollView>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.btnCancel]} onPress={onClose} disabled={equipProcessing}>
              <Text style={styles.btnText}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.btnPrimary, !selectedPetId && { opacity: 0.5 }]} onPress={handleEquip} disabled={!selectedPetId || equipProcessing}>
              <Text style={styles.btnText}>{equipProcessing ? 'Equipando...' : 'Equipar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PetCard({ pet, equipped, selected, onPress }) {
  const nome = pet.petName || pet.nome || 'Pet';
  const imgUrl = pet.petOutfitUrl;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, selected && styles.cardSelected]}>
      {imgUrl ? (
        <Image source={{ uri: imgUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{nome}</Text>
        {equipped && <Text style={styles.badge}>Equipado</Text>}
        {selected && <Text style={styles.badgeSelected}>Selecionado</Text>}
        {(pet.petBoostMoney || pet.petBoostXp || pet.petBoostFood) && (
          <Text style={styles.boosts}>Boosts: {pet.petBoostMoney || 0}💰 / {pet.petBoostXp || 0}XP / {pet.petBoostFood || 0}🍖</Text>
        )}
        {pet.apprenticePetEnergy !== undefined && (
          <Text style={styles.energy}>Energia: {pet.apprenticePetEnergy}/{pet.petMaxEnergy}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#04251F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0A4339'
  },
  title: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#FFF', fontSize: 14, marginTop: 4, marginBottom: 12 },
  list: { gap: 12 },
  empty: { color: '#FFF', textAlign: 'center', marginTop: 30 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#06342C',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0B5C4D',
    alignItems: 'center'
  },
  cardSelected: { borderColor: '#6C63FF' },
  image: { width: 64, height: 64, marginRight: 12 },
  imagePlaceholder: { backgroundColor: '#0A4339', borderRadius: 8 },
  cardInfo: { flex: 1 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  boosts: { color: '#C3F8FF', fontSize: 11, marginTop: 4 },
  energy: { color: '#FFD95E', fontSize: 12, marginTop: 2 },
  badge: { color: '#FFD95E', fontSize: 11, marginTop: 4 },
  badgeSelected: { color: '#6C63FF', fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  button: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  btnCancel: { backgroundColor: '#244F46' },
  btnPrimary: { backgroundColor: '#6C63FF' },
  btnText: { color: '#FFF', fontWeight: '600' }
});
