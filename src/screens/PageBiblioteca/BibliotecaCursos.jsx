import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import SearchBar from '../../components/SeachBiblioteca/Seach'
import CardsTrilhas from '../../components/CardTrilhas/CardsTrilhas'

export default function BibliotecaCursos() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.containerHeader}>
                <View style={styles.searchBar}>
                    <View style={styles.perfil}>
                    </View>
                    <SearchBar/>
                </View>
            </View>

            {/* Texto - Trilhas Disponiveis */}
            <View style={styles.TextTrilhas}>
                <Text style={{color: '#FFF', fontSize: 24, textAlign: 'left'}}> Trilhas Disponíveis </Text>
            </View>

            {/* Cards */}
            <CardsTrilhas />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#021713',
        paddingTop: 55,
        gap: 35
    },
    searchBar: {
        // backgroundColor: 'red',
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
        backgroundColor: 'blue',
        borderRadius: 100
    },
    TextTrilhas: {
        // backgroundColor: '#CE82FF',
        width: '95%',
        height: 50,
        justifyContent: 'center'

    }
})