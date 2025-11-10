import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'

export default function PageAtividade() {
    const route = useRoute();
    const navigation = useNavigation();
    const {
        activityId,
        activityName,
        activityDescription,
        activityPrice,
        activityDifficulty,
        trailId,
        trailName,
        index
    } = route.params || {};

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={{ color: '#928cffff' }}>Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{activityName || 'Atividade'}</Text>
            </View>

            <View style={styles.descriptionBox}>
                <Text style={styles.boxTitle}>Atividade {index != null ? index + 1 : ''}: {activityName}</Text>
                <Text style={styles.description}>{activityDescription || 'Sem descrição.'}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Dificuldade: {activityDifficulty || 'N/D'}</Text>
                    <Text style={styles.metaText}>XP: {activityPrice ?? 0}</Text>
                </View>
            </View>

            {/* Espaço para futura entrega de arquivo / inputs */}
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Sua entrega</Text>
                <Text style={styles.description}>Em breve: upload de arquivos e texto de resposta.</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Salvar rascunho</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6C63FF' }]}><Text style={[styles.actionText, { color: '#FFF' }]}>Entregar atividade</Text></TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#021713',
        padding: 20,
        paddingTop: 55
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#6C63FF55'
    },
    title: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: 'bold'
    },
    box: {
        backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#6C63FF55'
    },
    boxTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8
    },
    description: {
        color: '#E5E5E5',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    metaText: {
        color: '#B3B3B3',
        fontSize: 12
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        justifyContent: 'center',

    },
    actionBtn: {
        backgroundColor: '#592ced56',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10
    },
    actionText: {
        color: '#928cffff',
        fontWeight: '600'
    },
    descriptionBox: {
        // backgroundColor: '#1E3D35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 25,
        // borderWidth: 1,
        // borderColor: '#6C63FF55'
    }
})
