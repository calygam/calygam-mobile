import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import SearchBar from '../../components/SeachBiblioteca/Seach'
import CardsTrilhas from '../../components/CardTrilhas/CardsTrilhas'
import Modal from '../../components/BottomSheetModalPerfil/Modalperfil'
import { FlatList } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';

export default function BibliotecaCursos() {
    const [trails, setTrails] = useState([]);

    // Lista de Trilhas com Filtro
    useEffect(() => {
        const fetchTrails = async () => {
            try {
                
                const token = await AsyncStorage.getItem("userToken");
                console.log("TOKEN NO MOMENTO DA CHAMADA:", token);
                // const response = await axios.get('https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/trail/read/all-trails'
                const response = await api.get("/trail/read/all-trails", {
                    params: {
                        status: 'ativa', // Exemplo de filtro por status
                        // haveProgress: "HAVE_PROGRESS", // Exemplo de filtro por progresso
                        haveProgress: "NOT_HAVE_PROGRESS"

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


    return (

        <ScrollView style={{ flex: 1, backgroundColor: '#021713' }} >
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.containerHeader}>
                    <View style={styles.searchBar}>
                        <Modal />
                        <SearchBar />
                    </View>
                </View>

                {/* Texto - Trilhas Disponiveis */}
                <View style={styles.TextTrilhas}>
                    <Text style={{ color: '#FFF', fontSize: 24, textAlign: 'left' }}> Trilhas Disponíveis </Text>
                    <Text style={{ color: '#D9D9D9', fontSize: 15, textAlign: 'left', fontWeight: '100' }}> Explore novas áreas do conhecimento </Text>
                </View>

                <FlatList
                    data={trails}
                    renderItem={({ item }) => {
                        const professorName = item.user?.userName ?? 'Desconhecido'

                        return (
                            <CardsTrilhas
                                item={item}
                                professorName={professorName}
                            />
                        )
                    }}
                    keyExtractor={item => String(item.trailId || item.id || Math.random())}
                    contentContainerStyle={styles.flatListContainer}
                />

            </View >
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#021713',
        paddingTop: 50,
        gap: 35,
        height: 'auto',
        flex: 1,
        paddingBottom: 80

    },
    containerHeader: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        width: 'auto',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 18,
        zIndex: 2,
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
        justifyContent: 'center',
        gap: 8
    },
    flatListContainer: {
        flexGrow: 1,
        backgroundColor: '#021713',
        alignItems: 'center',
        gap: 25,
        height: 'auto',
        flex: 1,
        paddingTop: 30,
        marginBottom: 30

    }
})