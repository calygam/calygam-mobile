import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, {useEffect, useState} from 'react'
import { StyleSheet } from 'react-native'
import IconSeach from "../../../assets/svg/IconsInterface/icon_seach.svg";
import CardPets from '../../components/CardShop/CardPets';
import Pet from '../../../assets/image/imageShopPet/image-58.png'
import SkeletonPetCard from '../../components/SkeletoncomShimmer/SkeletonPetCard';

export default function ShopPage() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <SkeletonPetCard />;
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, color: '#FFF' }}>Loja Calygam 📦</Text>

      {/* Texto - Todos os Produtos */}
      <View style={styles.containerText}>
        <View style={{paddingLeft: 15}}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFF' }}>Todos os produtos</Text>
          <Text style={{ fontSize: 13, fontWeight: '300', color: '#FFF' }}>Explore nossa colecão completa de produtos</Text>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.containerSeachBar}>
          <IconSeach width={24} height={24} fill="#888" style={styles.icon} />
          <TextInput style={styles.TextInput} placeholder='Buscar' placeholderTextColor={'#61758A'} />
        </View>

        {/* Cards */}
        <ScrollView>
        <View style={styles.containerCard}>
          {loading ? (
            <SkeletonPetCard/>
          ) : (
          <View style={styles.card}>
            <CardPets nome='Raposa Foz' preco='12.000' imagem={require('../../../assets/image/imageShopPet/image-58.png')} />
            <CardPets nome='Tigrinho' preco='20.000' imagem={require('../../../assets/image/imageShopPet/image-58-1.png')} />
            <CardPets nome='Lobo' preco='100.000' imagem={require('../../../assets/image/imageShopPet/image-58-2.png')} />
            <CardPets nome='Nemo' preco='49.000' imagem={require('../../../assets/image/imageShopPet/image-58-3.png')} />
          </View>
          )}

          <View style={{height: 180}}>
            
          </View>
          
        </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#0FFF',
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
    gap: 15,
    alignItems: 'center',
    justifyContent: 'center'

  },
  containerCard: {
    // backgroundColor: 'red',

  }
})
