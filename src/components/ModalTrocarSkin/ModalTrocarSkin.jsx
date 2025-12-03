import React, { useEffect, useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { fetchEquippedPet, equipSkin, fetchOwnedSkins, fetchAllPetsWithSkins } from '../../services/petService';

/**
 * Modal para trocar skin do pet equipado
 * - Busca catálogo completo de skins (GET /pet/read-all)
 * - Filtra apenas skins do pet atual
 * - Mostra apenas skins que o usuário possui (comprou na loja)
 * - Não mostra skins de estado (feliz/triste) - apenas skins compradas
 */
export default function ModalTrocarSkin({ visible, onClose, onEquipped, initialSelectedSkinId }) {
    const [loading, setLoading] = useState(false);
    const [equippedPet, setEquippedPet] = useState(null);
    const [skins, setSkins] = useState([]); // skins compradas do usuário para o pet atual
    const [selectedSkinId, setSelectedSkinId] = useState(null);
    const [equipProcessing, setEquipProcessing] = useState(false);

    /**
     * Carrega skins do catálogo e filtra apenas as que o usuário possui
     */
    const loadSkins = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Buscar pet equipado
            const petAtual = await fetchEquippedPet();
            if (!petAtual?.petId) {
                Alert.alert('Erro', 'Nenhum pet equipado encontrado.');
                setLoading(false);
                return;
            }
            setEquippedPet(petAtual);

            // 2. Buscar catálogo completo de pets com outfits (GET /pet/read-all)
            const allPets = await fetchAllPetsWithSkins();
            const catalog = Array.isArray(allPets) ? allPets : [];
            
            // 3. Encontrar o pet no catálogo pelo petId
            const petCatalog = catalog.find(p => 
                Number(p.petId) === Number(petAtual.petId) || 
                p.petName === petAtual.petName
            );
            
            if (!petCatalog || !Array.isArray(petCatalog.outfits)) {
                setSkins([]);
                setLoading(false);
                return;
            }

            // 4. Buscar IDs de skins que o usuário possui (via /inventory/get/pet/skins)
            const ownedSkinsResponse = await fetchOwnedSkins();
            const ownedSkinsList = Array.isArray(ownedSkinsResponse) ? ownedSkinsResponse : [];
            
            // Extrair IDs de skins possuídas (use SEMPRE petOutfitId)
            const ownedSkinIds = new Set(
                ownedSkinsList
                  .map(s => s?.petOutfitId)
                  .filter(id => id !== null && id !== undefined)
                  .map(Number)
            );

            // 5. Filtrar outfits do catálogo:
            // - Apenas do pet atual
            // - Apenas os que o usuário possui (está no ownedSkinIds)
            // - Excluir skins de estado (HAPPY/EXHAUSTED) se necessário
            const availableSkins = petCatalog.outfits
                .filter(outfit => {
                    const outfitId = Number(outfit?.petOutfitId);
                    if (!outfitId) return false;
                    // Mostrar somente skins possuídas pelo usuário
                    if (!ownedSkinIds.has(outfitId)) return false;
                    // Excluir defaults/estados (feliz/triste): pela flag de pacote se existir
                    const pkg = String(outfit?.petOutfitPackageSkin || '').toUpperCase();
                    if (pkg.includes('DEFAULT')) return false;
                    // Filtro extra por nome (fallback) para evitar exibir estados
                    const name = String(outfit?.petOutfitName || '').toLowerCase();
                    if (name.includes('feliz') || name.includes('triste')) return false;
                    return true;
                })
                .map(outfit => ({
                    petOutfitId: outfit.petOutfitId,
                    petOutfitName: outfit.petOutfitName || 'Skin',
                    petUrlImage: outfit.petUrlImage, // campo do catálogo
                    petOutfitPlusMoney: outfit.petOutfitPlusMoney || 0,
                    petOutfitPlusXp: outfit.petOutfitPlusXp || 0,
                    petOutfitPlusFood: outfit.petOutfitPlusFood || 0,
                }));

            setSkins(availableSkins);

            // 6. Pré-seleção
            if (initialSelectedSkinId) {
                const found = availableSkins.find(s => Number(s.petOutfitId) === Number(initialSelectedSkinId));
                if (found) setSelectedSkinId(found.petOutfitId);
            }
        } catch (e) {
            console.error('Erro ao carregar skins para troca:', e);
            Alert.alert('Erro', 'Não foi possível carregar skins.');
        } finally {
            setLoading(false);
        }
    }, [initialSelectedSkinId]);

    useEffect(() => {
        if (visible) {
            loadSkins();
        } else {
            setSelectedSkinId(null);
            setEquipProcessing(false);
        }
    }, [visible, loadSkins]);

    const handleSelect = (skinId) => {
        setSelectedSkinId(skinId);
    };

    const handleEquip = async () => {
        if (!selectedSkinId) return;
        
        setEquipProcessing(true);
        try {
            const response = await equipSkin(selectedSkinId);
            if (response?.responseOk) {
                const atualizado = await fetchEquippedPet();
                onEquipped && onEquipped(atualizado);
                Alert.alert('Sucesso', response.responseMsg || 'Skin equipada.');
                onClose && onClose();
            } else {
                Alert.alert('Falha', response?.responseMsg || 'Não foi possível equipar a skin.');
            }
        } catch (e) {
            const msg = e?.response?.data?.responseMsg || 
                       e?.response?.data?.message || 
                       e?.message || 
                       'Erro ao equipar skin.';
            Alert.alert('Erro', msg);
        } finally {
            setEquipProcessing(false);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Trocar Skin</Text>
                    <Text style={styles.subtitle}>Selecione uma skin para o seu pet</Text>

                    {loading ? (
                        <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
                    ) : (
                        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                            {equippedPet && (
                                <View style={styles.equippedBox}>
                                    <Text style={styles.equippedTitle}>Pet equipado</Text>
                                    <View style={styles.equippedRow}>
                                        {equippedPet.petOutfitUrl ? (
                                            <Image source={{ uri: equippedPet.petOutfitUrl }} style={styles.equippedImg} resizeMode="contain" />
                                        ) : (
                                            <View style={[styles.equippedImg, styles.imagePlaceholder]} />
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.cardTitle}>{equippedPet.petName || 'Seu Pet'}</Text>
                                            <Text style={styles.energy}>Energia: {equippedPet.apprenticePetEnergy}/{equippedPet.petMaxEnergy}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {skins.map((skin) => (
                                <SkinCard
                                    key={skin.petOutfitId}
                                    skin={skin}
                                    selected={selectedSkinId === skin.petOutfitId}
                                    onPress={() => handleSelect(skin.petOutfitId)}
                                />
                            ))}
                            {skins.length === 0 && (
                                <Text style={styles.empty}>Você não possui skins compatíveis com seu pet.</Text>
                            )}
                        </ScrollView>
                    )}

                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.button, styles.btnCancel]} onPress={onClose} disabled={equipProcessing}>
                            <Text style={styles.btnText}>Fechar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.btnPrimary, !selectedSkinId && { opacity: 0.5 }]} 
                            onPress={handleEquip} 
                            disabled={!selectedSkinId || equipProcessing}
                        >
                            <Text style={styles.btnText}>{equipProcessing ? 'Equipando...' : 'Equipar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function SkinCard({ skin, selected, onPress }) {
    const nome = skin.petOutfitName || 'Skin';
    // Usar petUrlImage do catálogo (campo correto de /pet/read-all)
    const imgUrl = skin.petUrlImage || skin.petOutfitUrl;
    const plusMoney = skin.petOutfitPlusMoney || 0;
    const plusXp = skin.petOutfitPlusXp || 0;
    const plusFood = skin.petOutfitPlusFood || 0;
    
    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, selected && styles.cardSelected]}>
            {imgUrl ? (
                <Image source={{ uri: imgUrl }} style={styles.image} resizeMode="contain" />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]} />
            )}
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{nome}</Text>
                {selected && <Text style={styles.badgeSelected}>Selecionado</Text>}
                {(plusMoney > 0 || plusXp > 0 || plusFood > 0) && (
                    <Text style={styles.boosts}>Bônus: +{plusMoney}💰 / +{plusXp}XP / +{plusFood}🍖</Text>
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
        borderColor: '#0B5C4D'
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8
    },
    subtitle: {
        color: '#B7B7B7',
        fontSize: 14,
        marginBottom: 16
    },
    list: { 
        gap: 12 
    },
    empty: { 
        color: '#FFF', 
        textAlign: 'center', 
        marginTop: 30 
    },
    equippedBox: {
        backgroundColor: '#06342C',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#0B5C4D',
        marginBottom: 10
    },
    equippedTitle: { 
        color: '#FFF', 
        fontSize: 14, 
        marginBottom: 8 
    },
    equippedRow: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    equippedImg: { 
        width: 64, 
        height: 64, 
        marginRight: 12 
    },
    imagePlaceholder: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#06342C',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#0B5C4D',
        alignItems: 'center'
    },
    cardSelected: { 
        borderColor: '#6C63FF',
        borderWidth: 2
    },
    image: { 
        width: 64, 
        height: 64, 
        marginRight: 12 
    },
    cardInfo: { 
        flex: 1 
    },
    cardTitle: { 
        color: '#FFF', 
        fontSize: 16, 
        fontWeight: '600' 
    },
    boosts: { 
        color: '#C3F8FF', 
        fontSize: 11, 
        marginTop: 4 
    },
    energy: { 
        color: '#FFD95E', 
        fontSize: 12, 
        marginTop: 2 
    },
    badgeSelected: { 
        color: '#6C63FF', 
        fontSize: 11, 
        marginTop: 2 
    },
    actions: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        gap: 12, 
        marginTop: 20 
    },
    button: { 
        paddingVertical: 10, 
        paddingHorizontal: 18, 
        borderRadius: 8 
    },
    btnCancel: { 
        backgroundColor: '#244F46' 
    },
    btnPrimary: { 
        backgroundColor: '#6C63FF' 
    },
    btnText: { 
        color: '#FFF', 
        fontWeight: '600' 
    }
});
