import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconSeach from "../../../assets/svg/IconsInterface/icon_seach.svg";
import CardPets from '../../components/CardShop/CardPets';
import LoadingSkeletonShimmer from '../../components/LoadingSkeletonShimmer';
import apiAzure from "../../api/apiAzure";
import ModalDetalhesPet from '../../components/ModalDetalhesPet/ModalDetalhesPet';
import ModalConfirmacaoCompra from '../../components/ModalConfirmacaoCompra/ModalConfirmacaoCompra';
import ModalTrocarPet from '../../components/ModalTrocarPet/ModalTrocarPet';

export default function ShopPage() {

  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [comprando, setComprando] = useState(false);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [modalConfirmacaoVisible, setModalConfirmacaoVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [showModalTrocarPet, setShowModalTrocarPet] = useState(false);
  const [preSelectPetId, setPreSelectPetId] = useState(null);

  const handleAbrirDetalhes = (item) => {
    setItemSelecionado(item);
    setModalDetalhesVisible(true);
  };

  const handleAbrirConfirmacao = (item) => {
    setModalDetalhesVisible(false);
    setItemSelecionado(item);
    setModalConfirmacaoVisible(true);
  };

  const handleConfirmarCompra = async () => {
    if (comprando || !itemSelecionado) return;
    setComprando(true);
    try {
      const response = await apiAzure.post(
        `/emporium/purchase/obtain/item/${itemSelecionado.id}/type/${itemSelecionado.tipo}`
      );
      const msg = response.data?.responseMsg || 'Compra realizada!';
      setModalConfirmacaoVisible(false);
      setPets((prev) => prev.filter((item) => item.id !== itemSelecionado.id));
      // Fluxo pós-compra: oferecer equipar se for PET
      if (itemSelecionado.tipo === 'PET') {
        Alert.alert(
          'Sucesso',
          msg + '\nDeseja equipar este pet agora?',
          [
            { text: 'Não', style: 'cancel', onPress: () => {} },
            { text: 'Equipar', onPress: () => {
                setPreSelectPetId(itemSelecionado.id);
                setShowModalTrocarPet(true);
              } 
            }
          ]
        );
      } else {
        Alert.alert('Sucesso', msg);
      }
      setItemSelecionado(null);
    } catch (error) {
      const msg = error.response?.data?.message 
        || error.response?.data?.responseMsg 
        || 'Verifique o saldo ou Rank e Tente novamente.';
      Alert.alert('Erro na compra!', msg);
      console.error('Erro compra:', error.response?.data);
    } finally {
      setComprando(false);
    }
  };

  useEffect(() => {
    async function getPetsLoja() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        console.log('🔑 Token encontrado?', token ? 'SIM (length: ' + token.length + ')' : 'NÃO');
        
        if (!token) {
          Alert.alert(
            'Autenticação necessária',
            'Você precisa fazer login para acessar a loja.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }

        // Log do token (primeiros e últimos caracteres apenas por segurança)
        console.log('🔑 Token preview:', token.substring(0, 20) + '...' + token.substring(token.length - 20));
        
        // Testar se o token tem o formato correto (JWT tem 3 partes separadas por ponto)
        const partes = token.split('.');
        console.log('🔑 Token tem', partes.length, 'partes (deve ser 3 para JWT válido)');

        const response = await apiAzure.get("/emporium/search/stock");
        const data = response?.data || {};
        console.log('✅ Resposta da API:', data);

        // Mapeia pets e skins para um formato comum do CardPets
        const placeholderImg = require('../../../assets/image/imageShopPet/image-58.png');

        const petsCards = Array.isArray(data.pets) ? data.pets.map((pet) => ({
          id: pet.emporiumItemId || pet.petId,
          nome: pet.petName,
          preco: pet.emporiumItemGoldCost,
          imagem: pet.petOutfitUrl ? { uri: pet.petOutfitUrl } : placeholderImg,
          tipo: pet.emporiumItemCatalogType || 'PET',
          petBoostMoney: pet.petBoostMoney,
          petBoostXp: pet.petBoostXp,
          petBoostFood: pet.petBoostFood,
          petMinEnergy: pet.petMinEnergy,
          petDefaultEnergy: pet.petDefaultEnergy,
          petMaxEnergy: pet.petMaxEnergy,
        })) : [];

        const skinsCards = Array.isArray(data.skins) ? data.skins.map((skin) => ({
          id: skin.emporiumItemId || skin.petOutfitId,
          nome: skin.petOutfitName || `${skin.petName} — ${skin.petOutfitName}`,
          preco: skin.emporiumItemGoldCost,
          imagem: skin.petOutfitUrl ? { uri: skin.petOutfitUrl } : placeholderImg,
          tipo: skin.emporiumItemCatalogType || 'SKIN',
          petOutfitPlusMoney: skin.petOutfitPlusMoney || 0,
          petOutfitPlusXp: skin.petOutfitPlusXp || 0,
          petOutfitPlusFood: skin.petOutfitPlusFood || 0,
        })) : [];

        const lista = [...petsCards, ...skinsCards];
        console.log('📦 Itens para loja (qtd):', lista.length);
        setPets(lista);
      } catch (error) {
        console.error("❌ Erro ao buscar pets no Azure:", error);
        console.error("Status:", error.response?.status);
        console.error("Mensagem:", error.response?.data);
        
        // Mostrar mensagem amigável pro usuário
        if (error.response?.status === 403 || error.response?.status === 401) {
          Alert.alert(
            'Sessão expirada',
            'Faça login novamente para acessar a loja.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Erro',
            'Não foi possível carregar os produtos. Tente novamente.',
            [{ text: 'OK' }]
          );
        }
      } finally {
        setLoading(false);
      }
    }

    getPetsLoja();
  }, []);
  if (loading) {
    return <LoadingSkeletonShimmer type="cards" count={15} />;
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={{ fontSize: 24, color: '#FFF' }}>Loja Calygam 📦</Text>

        {/* Texto - Todos os Produtos */}
        <View style={styles.containerText}>
          <View style={{ paddingLeft: 15 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFF' }}>Todos os produtos</Text>
            <Text style={{ fontSize: 13, fontWeight: '300', color: '#FFF' }}>Explore nossa colecão completa de produtos</Text>
          </View>

          {/* Barra de Pesquisa */}
          <View style={styles.containerSeachBar}>
            <IconSeach width={24} height={24} fill="#888" style={styles.icon} />
            <TextInput style={styles.TextInput} placeholder='Buscar' placeholderTextColor={'#61758A'} />
          </View>

          {/* Cards */}

          <View style={styles.containerCard}>
            {loading ? (
              <LoadingSkeletonShimmer type="cards" count={30} />
            ) : (
              <View style={styles.card}>
                {(Array.isArray(pets) ? pets : []).map((item, index) => (
                  <CardPets 
                    key={item.id || index} 
                    id={item.id}
                    tipo={item.tipo}
                    nome={item.nome} 
                    preco={item.preco} 
                    imagem={item.imagem}
                    onPress={() => handleAbrirDetalhes(item)}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 180 }}>

            </View>

          </View>

        </View>
      </View>

      {/* Modais */}
      <ModalDetalhesPet
        visible={modalDetalhesVisible}
        onClose={() => setModalDetalhesVisible(false)}
        item={itemSelecionado}
        onComprar={handleAbrirConfirmacao}
      />
      <ModalConfirmacaoCompra
        visible={modalConfirmacaoVisible}
        onClose={() => setModalConfirmacaoVisible(false)}
        item={itemSelecionado}
        onConfirmar={handleConfirmarCompra}
        loading={comprando}
      />
      <ModalTrocarPet
        visible={showModalTrocarPet}
        onClose={() => { setShowModalTrocarPet(false); setPreSelectPetId(null); }}
        initialSelectedPetId={preSelectPetId}
        onEquipped={() => { setShowModalTrocarPet(false); setPreSelectPetId(null); }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 55,
    gap: 35,
    backgroundColor: '#021713'
  },
  containerText: {
    // backgroundColor: 'red',
    width: 'auto',
    gap: 20
  },
  TextInput: {
    backgroundColor: '#FFF',
    width: '80%',
    height: 45,
    fontWeight: '200'
  },
  containerSeachBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginLeft: 15,
    marginRight: 15

  },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 'auto'

  },
  containerCard: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#021713',
    width: '100%',
    height: 'auto',

  }
})
