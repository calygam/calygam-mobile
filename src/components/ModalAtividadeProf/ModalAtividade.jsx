import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import CalygamDropDown from '../InteractiveDropdown/DropDopdwnDificuladade';

// Versão simplificada pedida
export function StepBottomSheetContent({ onSave, isEditing, initialActivities }) {
    const [activities, setActivities] = useState([]);
    const [current, setCurrent] = useState({
        activityName: '',
        activityDescription: '',
        activityDifficulty: 'EASY', // manter formato UPPERCASE compatível com o backend
    });

    useEffect(() => {
        if (isEditing && initialActivities) {
            setActivities(initialActivities);
        }
    }, [isEditing, initialActivities]);

    const handleAddActivity = () => {
        if (!current.activityName || !current.activityDescription) {
            Alert.alert("Atenção!", "Preencha todos os campos da atividade.");
            return;
        }
        const newList = [...activities, current];
        setActivities(newList);
        setCurrent({
            activityName: '',
            activityDescription: '',
            activityDifficulty: 'EASY',
        });
    };

    const handleSaveAll = () => {
        if (activities.length < 1) {
            Alert.alert("Atenção", `Crie mais ${1 - activities.length} atividades para liberar a trilha.`);
            return;
        }
        onSave && onSave(activities);
    };

    return (
        <BottomSheetScrollView
            contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 12 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator
            nestedScrollEnabled
        >
            <Text style={styles.title}>{isEditing ? 'Editar Atividades' : 'Criar Atividades'}</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome da Atividade"
                placeholderTextColor="#AAA"
                value={current.activityName}
                onChangeText={(v) => setCurrent({ ...current, activityName: v })}
            />
            <TextInput
                style={styles.input}
                placeholder="Descrição da Atividade"
                placeholderTextColor="#AAA"
                value={current.activityDescription}
                onChangeText={(v) => setCurrent({ ...current, activityDescription: v })}
            />
            <CalygamDropDown
                value={current.activityDifficulty}
                // Garante que o valor usado no estado e enviado ao back esteja em UPPERCASE
                onChange={(diff) => setCurrent({ ...current, activityDifficulty: String(diff).toUpperCase() })}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
                <Text style={styles.addText}>Adicionar Atividade</Text>
            </TouchableOpacity>
            <Text style={styles.subtitle}>Atividades Criadas: {activities.length}</Text>
            {activities.map((a, i) => (
                <View key={i} style={styles.listItem}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome da Atividade"
                        placeholderTextColor="#AAA"
                        value={a.activityName}
                        onChangeText={(v) => {
                            const newList = [...activities];
                            newList[i].activityName = v;
                            setActivities(newList);
                        }}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Descrição da Atividade"
                        placeholderTextColor="#AAA"
                        value={a.activityDescription}
                        onChangeText={(v) => {
                            const newList = [...activities];
                            newList[i].activityDescription = v;
                            setActivities(newList);
                        }}
                    />
                    <CalygamDropDown
                        value={a.activityDifficulty}
                        onChange={(diff) => {
                            const newList = [...activities];
                            newList[i].activityDifficulty = String(diff).toUpperCase();
                            setActivities(newList);
                        }}
                    />
                </View>
            ))}
            <TouchableOpacity
                style={[styles.saveButton, activities.length < 1 && { backgroundColor: '#555' }]}
                disabled={activities.length < 1}
                onPress={handleSaveAll}
            >
                <Text style={styles.saveText}>
                    {activities.length < 1
                        ? `Crie mais ${1 - activities.length} atividades`
                        : isEditing ? 'Salvar Edições' : 'Salvar e Criar Trilha'}
                </Text>
            </TouchableOpacity>
        </BottomSheetScrollView>
    );
}

export default StepBottomSheetContent;

const styles = StyleSheet.create({
    title: { fontWeight: 'bold', fontSize: 20, marginBottom: 15, color: '#FFF' },
    input: {
        borderWidth: 1,
        borderColor: '#FFF',
        color: '#FFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#6C63FF',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    addText: { color: '#FFF', fontWeight: 'bold' },
    listItem: {
        padding: 10,
        backgroundColor: '#1E3D35',
        borderRadius: 8,
        marginBottom: 10,
    },
    subtitle: { color: '#FFF', marginVertical: 10, fontSize: 16 },
    saveButton: {
        backgroundColor: '#05FF5C',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    saveText: { color: '#000', fontWeight: 'bold' },
});
