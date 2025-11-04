import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import SearchBar from '../../components/SeachBiblioteca/Seach'
import CardsTrilhas from '../../components/CardTrilhas/CardsTrilhas'
import IconReact from "../../../assets/svg/IconsInterface/react-1.svg";
import IconBancoDeDados from "../../../assets/svg/IconsInterface/base-de-dados-1.svg";
import IconFront from "../../../assets/svg/IconsInterface/codigo-simples-1.svg";
import IconJava from "../../../assets/svg/IconsInterface/group.svg";
import IconAdobeIllustrador from "../../../assets/svg/IconsInterface/illustrator-1.svg";
import { FlatList } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BibliotecaCursos() {
    const [trails, setTrails] = useState([]);

    // Lista de Trilhas com Filtro
    useEffect(() => {
        const fetchTrails = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const response = await axios.get('http://10.0.0.191:8080/trail/read/all-trails', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Substitua ${token} pelo token real se necessário
                    },
                    params: {
                        status: 'ativa', // Exemplo de filtro por status
                        haveProgress: true // Exemplo de filtro por progresso
                    },
                });
                setTrails(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar as trilhas.');
                console.error('Erro ao buscar trilhas:', error);
            }
        }
        fetchTrails();
    }, []);

    const renderHeader = () => (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.containerHeader}>
                <View style={styles.searchBar}>
                    <SearchBar />
                </View>
            </View>

            {/* Texto - Trilhas Disponiveis */}
            <View style={styles.TextTrilhas}>
                <Text style={{ color: '#FFF', fontSize: 24, textAlign: 'left' }}> Trilhas Disponíveis </Text>
            </View>
        </View>
    );

    return (
        <FlatList
            data={trails}
            renderItem={({ item }) => (
                <CardsTrilhas NameTrail={item.name} Icons={item.icon} />
            )}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.flatListContainer}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#021713',
        paddingTop: 55,
        gap: 35
    },
    searchBar: {
        width: 320,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 18,
    },
    perfil: {
        height: 50,
        width: 50,
        backgroundColor: 'red',
        borderRadius: 100
    },
    TextTrilhas: {
        width: '95%',
        height: 50,
        justifyContent: 'center'
    },
    flatListContainer: {
        flexGrow: 1,
        backgroundColor: '#021713',
        alignItems: 'center',
    }
})