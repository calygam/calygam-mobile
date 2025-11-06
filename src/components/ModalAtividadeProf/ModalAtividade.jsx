import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalygamDropDown from '../InteractiveDropdown/DropDopdwnDificuladade';

// Componente interno reutilizável para o conteúdo do modal
export function StepBottomSheetContent({ onSave }) {
    const totalSteps = 2;
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        activities: [{ activityName: '', activityDescription: '', activityPoints: '', activityDifficulty: 'easy' }],
    });

    const handleInputChange = (name, value) => {
        const updated = [...form.activities];
        updated[step - 1][name] = value;
        setForm({ activities: updated });
    };

    const handleDifficultyChange = (difficulty) => {
        handleInputChange('activityDifficulty', difficulty);
    };

    const handleNext = () => {
        if (step < totalSteps) setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(form.activities);
        } else {
            console.log('Form enviado:', form);
        }
    };

    return (
        <>
            <Text style={styles.title}>Adicionar Atividade - Etapa {step}</Text>

            {/* Step 1 */}
            {step === 1 && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome da Atividade"
                        value={form.activities[step - 1].activityName}
                        onChangeText={text => handleInputChange('activityName', text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Descrição da Atividade"
                        value={form.activities[step - 1].activityDescription}
                        onChangeText={text => handleInputChange('activityDescription', text)}
                    />
                    <CalygamDropDown
                        value={form.activities[step - 1].activityDifficulty}
                        onChange={handleDifficultyChange}
                    />
                </>
            )}

            {/* Botões de navegação */}
            <View style={styles.footer}>
                {step > 1 && (
                    <TouchableOpacity onPress={handleBack} style={[styles.button, styles.secondary]}>
                        <Text style={styles.buttonText}>Voltar</Text>
                    </TouchableOpacity>
                )}

                {step < totalSteps ? (
                    <TouchableOpacity onPress={handleNext} style={styles.button}>
                        <Text style={styles.buttonText}>Próximo</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleSave} style={styles.button}>
                        <Text style={styles.buttonText}>{onSave ? 'Salvar e Criar Trilha' : 'Salvar'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
}

export default function StepBottomSheet() {
    const bottomSheetRef = useRef(null);
    // const totalSteps = 2;
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        activities: [{ activityName: '', activityDescription: '', activityPoints: '', activityDifficulty: 'easy' }],
    });

    const snapPoints = useMemo(() => ['80%', '100%'], []);

    const handleInputChange = (name, value) => {
        const updated = [...form.activities];
        updated[step - 1][name] = value;
        setForm({ activities: updated });
    };

    const handleDifficultyChange = (difficulty) => {
        handleInputChange('activityDifficulty', difficulty);
    };

    const handleNext = () => {
        if (step < totalSteps) setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const handleSave = () => {
        console.log('Form enviado:', form);
        bottomSheetRef.current?.close();
    };

    const openBottomSheet = () => bottomSheetRef.current?.expand();

    return (
        <GestureHandlerRootView style={{ flex: 1, width: '100%' }}>
            <View style={styles.screen}>
                <TouchableOpacity onPress={openBottomSheet} style={styles.openButton}>
                    <Text style={styles.openText}>Abrir BottomSheet</Text>
                </TouchableOpacity>

                <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
                    <BottomSheetScrollView style={styles.content}>
                        <StepBottomSheetContent
                            form={form}
                            setForm={setForm}
                            step={step}
                            setStep={setStep}
                            onSave={handleSave}
                        />
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    openButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    openText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 15,
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#FFFFFF',
        color: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    secondary: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
});
