import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchEquippedPet, feedPet } from '../../services/petService';
import ModalTrocarPet from '../../components/ModalTrocarPet/ModalTrocarPet';

export default function TestePet({ route, renderEmpty }) {
    const [pet, setPet] = useState(route?.params?.pet || null);
    const [showBoosts, setShowBoosts] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTrocarPet, setShowTrocarPet] = useState(false);

    // Carrega pet e dados do usuário
    useEffect(() => {
        loadPetData();
    }, []);

    const loadPetData = async () => {
        try {
            const equippedPet = await fetchEquippedPet();
            setPet(equippedPet);
        } catch (error) {
            console.error('Erro ao carregar pet:', error);
        }
    };

    if (!pet) {
        if (renderEmpty) return renderEmpty();
        return (
            <View style={styles.container}>
                <Text style={{ color: '#FFF', fontSize: 18 }}>Nenhum pet equipado</Text>
            </View>
        );
    }

    // Dados diretos do backend (InventoryPetsDTO)
    const petName = pet.petName || 'Seu Pet';
    const petImage = pet.petOutfitUrl || null;
    const energia = pet.apprenticePetEnergy || 0;
    const energiaMax = pet.petMaxEnergy || 100;
    const energiaMin = pet.petMinEnergy || 30;
    const feedQtd = pet.petFeedQtd || 10; // baseFraction
    const multiplierUp = pet.petMultiplierUp || 0; // máximo de parcelas que pode alimentar

    const handleFeed = async (feedMax = false) => {
        if (!pet?.petId) return;
        if (multiplierUp === 0) {
            Alert.alert('Atenção', 'Você não tem comida suficiente ou seu pet já está cheio!');
            return;
        }
        setLoading(true);
        try {
            const response = await feedPet(pet.petId, feedMax);
            if (response.responseOk) {
                Alert.alert('Sucesso! 🎉', response.responseMsg || 'Pet alimentado!');
                await loadPetData(); // Recarrega GET /inventory/get/pet/equipped
            } else {
                Alert.alert('Aviso', response.responseMsg || 'Não foi possível alimentar o pet.');
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'O seu pet não pode ser alimentado!';
            Alert.alert('Erro', msg);
        } finally {
            setLoading(false);
        }
    };

    // Estado de felicidade (backend já calcula)
    const isHappy = energia >= energiaMin;
    const energiaColor = isHappy ? '#4CAF50' : '#C1121F';

    // Boosts
    const boostMoney = pet.petBoostMoney || 0;
    const boostXp = pet.petBoostXp || 0;
    const boostFood = pet.petBoostFood || 0;

    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}>
            <View style={styles.CardContainer}>

                {/* Nome do Pet */}
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={styles.petName}>{petName}</Text>
                </View>

                {/* Imagem do Pet */}
                <View style={styles.petGifContainer}>
                    {petImage ? (
                        <Image source={{ uri: petImage }} style={{ width: '100%', height: '100%', borderRadius: 20 }} resizeMode="contain" />
                    ) : (
                        <Text style={{ color: '#666', fontSize: 16 }}>Sem imagem</Text>
                    )}
                </View>

                {/* Barras de Progresso */}
                <View style={{ width: '90%', alignSelf: 'center', marginTop: 20 }}>
                    {/* Energia */}
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={{ color: '#FFF', fontSize: 14, flex: 1 }}>⚡ Energia</Text>
                            <Text style={{ color: '#FFF', fontSize: 14 }}>{energia}/{energiaMax}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${(energia / energiaMax) * 100}%`, backgroundColor: energiaColor }]} />
                        </View>
                        <Text style={{ color: energiaColor, fontSize: 12, marginTop: 3 }}>
                            {isHappy ? '😊 Feliz' : '😞 Exausto'}
                        </Text>
                    </View>

                    {/* Alimentações disponíveis (calculado pelo backend) */}
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={{ color: '#FFF', fontSize: 14, flex: 1 }}>🍖 Alimentações</Text>
                            <Text style={{ color: '#FFF', fontSize: 14 }}>{multiplierUp}x ({feedQtd} energia)</Text>
                        </View>
                        <Text style={{ color: '#AAA', fontSize: 12 }}>
                            {multiplierUp > 0 ? `Você pode alimentar até ${multiplierUp} vezes` : 'Sem comida ou pet já está cheio'}
                        </Text>
                    </View>
                </View>

                {/* Boosts (expansível) */}
                <TouchableOpacity onPress={() => setShowBoosts(!showBoosts)} style={{ width: '90%', alignSelf: 'center', marginTop: 10 }}>
                    <View style={styles.boostsHeader}>
                        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>💪 Boosts</Text>
                        <Text style={{ color: '#FFF', fontSize: 18 }}>{showBoosts ? '▲' : '▼'}</Text>
                    </View>
                </TouchableOpacity>

                {showBoosts && (
                    <View style={styles.boostsContent}>
                        <View style={styles.boostRow}>
                            <Text style={styles.boostIcon}>💰</Text>
                            <Text style={styles.boostText}>Moedas:</Text>
                            <Text style={styles.boostValue}>+{Math.round((boostMoney - 1) * 100)}%</Text>
                        </View>
                        <View style={styles.boostRow}>
                            <Text style={styles.boostIcon}>⭐</Text>
                            <Text style={styles.boostText}>XP:</Text>
                            <Text style={styles.boostValue}>+{Math.round((boostXp - 1) * 100)}%</Text>
                        </View>
                        <View style={styles.boostRow}>
                            <Text style={styles.boostIcon}>🍖</Text>
                            <Text style={styles.boostText}>Comida:</Text>
                            <Text style={styles.boostValue}>+{Math.round((boostFood - 1) * 100)}%</Text>
                        </View>
                    </View>
                )}

                {/* Botões de Alimentação */}
                <View style={{ width: '90%', alignSelf: 'center', marginTop: 10, gap: 10 }}>
                    <TouchableOpacity 
                        style={[styles.btnFeed, loading && { backgroundColor: '#666' }]} 
                        onPress={() => handleFeed(false)}
                        disabled={loading || multiplierUp === 0}
                    >
                        <Text style={styles.btnText}>🍖 Alimentar 1x ({feedQtd} energia)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.btnFeedMax, loading && { backgroundColor: '#666' }]} 
                        onPress={() => handleFeed(true)}
                        disabled={loading || multiplierUp === 0}
                    >
                        <Text style={styles.btnText}>🍖🍖 Alimentar Máximo</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Botões de Ações */}
            <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 20, gap: 12, marginBottom: 20 }}>
                <TouchableOpacity style={styles.btnTrocar} onPress={() => setShowTrocarPet(true)}>
                    <Text style={styles.btnText}> Trocar Pet </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDesequipar}>
                    <Text style={styles.btnText}>Desequipar</Text>
                </TouchableOpacity>
            </View>
            {/* Modal Trocar Pet */}
            <ModalTrocarPet
                visible={showTrocarPet}
                onClose={() => setShowTrocarPet(false)}
                onEquipped={() => {
                    setShowTrocarPet(false);
                    loadPetData();
                }}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#021713',
        justifyContent: 'center',
        alignItems: 'center',
    },
    CardContainer: {
        width: '100%',
        height: 'auto',
        borderWidth: 5,
        borderColor: '#6C63FF',
        borderRadius: 40,
        backgroundColor: '#000',
        paddingBottom: 20,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        borderWidth: 2.5,
        borderColor: '#6C63FF',
        borderRadius: 20,
        padding: 12,
        width: '85%',
        textAlign: 'center',
    },
    petGifContainer: {
        height: 180,
        width: '95%',
        marginTop: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 20,
    },
    progressBarBg: {
        width: '100%',
        height: 12,
        backgroundColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 10,
    },
    boostsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#6C63FF',
    },
    boostsContent: {
        width: '90%',
        alignSelf: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        padding: 15,
        marginTop: 10,
    },
    boostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    boostIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    boostText: {
        color: '#FFF',
        fontSize: 15,
        flex: 1,
    },
    boostValue: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnTrocar: {
        paddingHorizontal: 25,
        height: 50,
        backgroundColor: '#6C63FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDesequipar: {
        paddingHorizontal: 25,
        height: 50,
        backgroundColor: '#C1121F',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    btnFeed: {
        paddingHorizontal: 20,
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnFeedMax: {
        paddingHorizontal: 20,
        height: 50,
        backgroundColor: '#FF9800',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    }
})