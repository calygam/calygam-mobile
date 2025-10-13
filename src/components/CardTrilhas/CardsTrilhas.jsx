import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Dimensions } from 'react-native'
import IconPessoas from "../../../assets/svg/IconsInterface/users-alt-1.svg";

const { width, height } = Dimensions.get('window')

export default function CardsTrilhas({ NameTrail, Icons }) {
    return (
        <View style={styles.container}>
            <View style={styles.BoxCard}>

                <View style={styles.FotoTrilha}>
                </View>

                <View style={styles.Infomações}>
                    <View>
                        <Text style={styles.TextTrilha} > Trilha </Text>
                    </View>

                    <Text style={styles.title}>{NameTrail}</Text>

                    <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                        <IconPessoas width={15} height={24} fill="#fff" />
                        <Text style={{ color: '#FFF', fontSize: 12 }}>40/ 45</Text>
                    </View>

                </View>

                <View style={styles.FotoIconTrilha}>
                    <Icons width={24} height={24} fill="#fff" />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0D1912',
        borderWidth: 2,
        borderColor: '#FFF',
        width: width * 0.9,
        height: 'auto',
        borderRadius: 20,
        justifyContent: 'center',
        padding: 11,
    },
    BoxCard: {
        flexDirection: 'row',
        gap: 10,
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center'
    },
    FotoTrilha: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 15
    },
    Infomações: {
        // backgroundColor: '#0089ED',
        width: '57%',
        height: 65,
    },
    FotoIconTrilha: {
        backgroundColor: '#6C63FF',
        height: 50,
        width: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    TextTrilha: {
        color: '#6C63FF'
    },
    title: {
        color: '#FFF',
        fontWeight: '200',
        fontSize: 15

    }
})