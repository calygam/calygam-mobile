import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import SearchBar from '../../components/SeachBiblioteca/Seach'
import CardsTrilhas from '../../components/CardTrilhas/CardsTrilhas'
import IconReact from "../../../assets/svg/IconsInterface/react-1.svg";
import IconBancoDeDados from "../../../assets/svg/IconsInterface/base-de-dados-1.svg";
import IconFront from "../../../assets/svg/IconsInterface/codigo-simples-1.svg";
import IconJava from "../../../assets/svg/IconsInterface/group.svg";
import IconAdobeIllustrador from "../../../assets/svg/IconsInterface/illustrator-1.svg";
import { ScrollView } from 'react-native';


export default function BibliotecaCursos() {
    return (
        <ScrollView>
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

                {/* Cards */}

                <CardsTrilhas NameTrail="Java - BackEnd" Icons={IconJava} />
                <CardsTrilhas NameTrail="Banco De Dados" Icons={IconBancoDeDados} />
                <CardsTrilhas NameTrail="Adobe - Illustrador" Icons={IconAdobeIllustrador} />
                <CardsTrilhas NameTrail="FrontEnd - Tailwind" Icons={IconFront} />
                <CardsTrilhas NameTrail="React-Native" Icons={IconReact} />
                <CardsTrilhas NameTrail="Java - BackEnd" Icons={IconJava} />

            </View>
        </ScrollView>
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
        backgroundColor: 'red',
        borderRadius: 100
    },
    TextTrilhas: {
        // backgroundColor: '#CE82FF',
        width: '95%',
        height: 50,
        justifyContent: 'center'

    }
})