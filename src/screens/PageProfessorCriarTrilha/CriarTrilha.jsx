import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Image } from 'react-native'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import api from '../../api/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import IconImage from "../../../assets/svg/image-plus.svg";
import IconUpload from "../../../assets/svg/upload-cloud-02.svg";
import IconAdicionar from "../../../assets/svg/adicionar.svg";
import CardProf from '../../components/CardProfTrilhas/CardProf'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as ImagePicker from 'expo-image-picker';

export default function CriarTrilha() {
    const navigation = useNavigation()
    const [nome, setNome] = useState('')
    const [professorId, setProfessorId] = useState('')
    const [vagas, setVagas] = useState('')
    const [descricao, setDescricao] = useState('')
    const [senha, setSenha] = useState('')
    const [image, setImage] = useState(null)

    const [bottomSheetOpen, setBottomSheetOpen] = useState(false)

    const snapPoints = useMemo(() => ['55%', '100%'], [])
    const bottomSheetRef = useRef(null)

    // Função para selecionar imagem da galeria
    const pickImage = async () => {
        // Solicitar permissão
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar imagens.')
            return
        }

        // Abrir galeria
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)  // Armazena a URI da imagem selecionada
        }
    }

    const criarTrilha = async () => {
        if (!nome || !vagas || !professorId) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.')
            return
        }
        try {
            const response = await api.post('/trilhas', {
                nome: nome,
                vagas: parseInt(vagas),
                professorId: professorId,
                status: 'ativa',
                descricao: descricao,
                senha: senha,
            }, {
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                }
            })
            Alert.alert('Sucesso', 'Trilha criada com sucesso!')
            setBottomSheetOpen(false)
            navigation.navigate('PageProfessorTrilhas')
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar a trilha. Tente novamente mais tarde.')
            console.error(error)
        }
    }

    const handlePresentModalPress = () => {
        setBottomSheetOpen(true)
        bottomSheetRef.current?.expand()
    }

    const handleCloseModal = () => {
        setBottomSheetOpen(false)
        bottomSheetRef.current?.close()
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>

                {/* Texto Criar Trilha */}
                <View style={{ color: '#FFF' }}>
                    <Text style={{ color: '#FFF' }}>CriarTrilha</Text>
                </View>

                {/* Card */}
                <CardProf
                    titulo="Design de Interfaces Figma"
                    professorNome="Lucas Correa"
                    vagas="20"
                />

                {/* Botão de Add */}
                <View style={{ position: 'absolute', bottom: 110, right: 30 }}>
                    <TouchableOpacity onPress={handlePresentModalPress} style={{ backgroundColor: '#6C63FF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}>
                        <IconAdicionar width={20} height={30} />
                    </TouchableOpacity>
                </View>

                {/* Modal (BottomSheet) */}
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    index={-1}
                    enablePanDownToClose={true}
                    backgroundStyle={{ backgroundColor: '#0D141C' }}
                >
                    <BottomSheetView style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Criar Nova Trilha</Text>

                        <Text style={styles.label}>Nome da Trilha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Figma "
                            placeholderTextColor="#888"
                            value={nome}
                            onChangeText={setNome}
                        />
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="384&E9 "
                            placeholderTextColor="#888"
                            value={professorId}
                            onChangeText={setProfessorId}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <View style={{ width: 60, height: 60, backgroundColor: '#F5F5F5', borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10, flexDirection: 'row' }}>
                                {image ? (
                                    <Image source={{ uri: image }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                                ) : (
                                    <IconImage width={40} height={50} />
                                )}
                            </View>

                            {/* Botão de adicionar imagem */}
                            <TouchableOpacity onPress={pickImage} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5, borderColor: '#FFF', borderWidth: 2, padding: 10, borderRadius: 18}}>
                                <IconUpload width={30} height={30} />
                                <Text style={{ color: '#FFF', fontSize: 14 }}>Adicionar Imagem</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Número de Vagas</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Número de Vagas"
                            placeholderTextColor="#888"
                            value={vagas}
                            onChangeText={setVagas}
                            keyboardType="numeric"
                        />
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Essa trilha é focada em..."
                            placeholderTextColor="#888"
                            value={descricao}
                            onChangeText={setDescricao}
                        />
                        <TouchableOpacity style={styles.confirmButton} onPress={criarTrilha}>
                            <Text style={styles.confirmText}>Criar Trilha</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheet>


            </View>
        </GestureHandlerRootView>
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
    modalTitle: {
        fontSize: 24,
        color: '#FFF',
        marginBottom: 20,
        alignSelf: 'center'
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        width: '100%',
        height: 45
    },
    confirmButton: {
        backgroundColor: '#6C63FF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    confirmText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cancelButton: {
        backgroundColor: '#FF4B4B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    cancelText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalContent: {
        flex: 1,
        padding: 15,
        backgroundColor: '#0D141C',
    },
    label: {
        color: '#FFF',
        marginBottom: 5,
        marginTop: 10
    }

})