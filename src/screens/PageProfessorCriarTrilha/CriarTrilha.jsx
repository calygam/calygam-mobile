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
import { jwtDecode } from 'jwt-decode'
import { StepBottomSheetContent } from '../../components/ModalAtividadeProf/ModalAtividade';
import axios from 'axios';

export default function CriarTrilha() {
    const navigation = useNavigation()
    const [nome, setNome] = useState('')
    const [professorId, setProfessorId] = useState('')
    const [vagas, setVagas] = useState('')
    const [descricao, setDescricao] = useState('')
    const [senha, setSenha] = useState('')
    const [image, setImage] = useState(null)
    const [userToken, setUserToken] = useState(null)
    const [userId, setUserId] = useState(null)
    const [activities, setActivities] = useState([]) // ← Novo estado para atividades

    const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
    const [activitySheetOpen, setActivitySheetOpen] = useState(false) // ← Controla modal de atividades

    const snapPoints = useMemo(() => ['55%', '100%'], [])
    const bottomSheetRef = useRef(null)
    const activitySheetRef = useRef(null) // ← Ref para modal de atividades

    // ← Novo useEffect para decodificar o token e pegar userId
    useEffect(() => {
        const loadUserId = async () => {
            const token = await AsyncStorage.getItem('userToken');
            console.log('Token carregado do AsyncStorage:', token);
            setUserToken(token);  // ← Armazena o token no estado

            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    console.log('payload do token:', decoded);
                    setUserId(decoded.userId);  // ← Assume que o JWT tem "userId"
                    setProfessorId(decoded.userId.toString());  // ← Define professorId automaticamente
                } catch (error) {
                    console.error('Erro ao decodificar token:', error);
                }
            }
        };
        loadUserId();
    }, []);

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

    const handleOpenActivityModal = () => {
        // Valida campos básicos antes de abrir modal de atividades
        if (!nome || !vagas || !descricao) {
            Alert.alert('Atenção', 'Por favor, preencha nome, vagas e descrição antes de adicionar atividades.')
            return
        }
        setBottomSheetOpen(false)
        bottomSheetRef.current?.close()
        setTimeout(() => {
            setActivitySheetOpen(true)
            activitySheetRef.current?.expand()
        }, 300)
    }

    const handleSaveActivities = (savedActivities) => {
        setActivities(savedActivities)
        setActivitySheetOpen(false)
        activitySheetRef.current?.close()
        // Agora envia tudo
        criarTrilha()
    }

    const criarTrilha = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            console.log('Token usado na requisição:', token);

            if (!token) {
                Alert.alert('Erro', 'Token de autenticação inválido. Faça login novamente.');
                return;
            }

            const professor = userId ?? (professorId ? parseInt(professorId) : null);
            if (!nome || !vagas || !professor) {
                Alert.alert('Erro', 'Por favor, preencha todos os campos.')
                return
            }


            // Monta um objeto "form" com os dados atuais da tela para manter a estrutura do trecho enviado
            const form = {
                trailName: nome || '',
                trailDescription: descricao || '',
                trailPoints: 0, // ajuste quando houver campo de preço
                trailImage: image
                    ? {
                        uri: image,
                        name: 'trilha.jpg',
                        type: 'image/jpeg',
                    }
                    : null,
                trailPassword: senha || '',
                trailVacancy: vagas || '0',
                activities: activities, // ← Usa as atividades do estado
            }

            // Se existir algum código alvo, defina aqui; caso contrário, omitiremos
            const codeTarget = undefined // ajuste conforme sua lógica

            // ===== Trecho encaixado e válido =====
            const formData = new FormData();
            formData.append('trailName', form.trailName.trim());
            formData.append('trailDescription', form.trailDescription.trim());
            const rawtrailPts = String(form.trailPoints).replace(/[.,]/g, '');
            formData.append('trailPrice', Number(rawtrailPts));
            if (form.trailImage) formData.append('trailFileImage', form.trailImage);
            formData.append('trailPassword', (form.trailPassword || '').trim());
            formData.append('trailVacancies', Number(form.trailVacancy));
            form.activities.forEach((activity, index) => {
                if (activity.activityId) {
                    formData.append(`activities[${index}].activityId`, String(activity.activityId));
                }
                formData.append(`activities[${index}].activityName`, activity.activityName || '');
                formData.append(`activities[${index}].activityDescription`, activity.activityDescription || '');
                const rawActPts = String(activity.activityPoints || 0).replace(/[.,]/g, '');
                const intValue = parseInt(rawActPts);
                const validValue = isNaN(intValue) ? 0 : intValue;
                formData.append(`activities[${index}].activityPrice`, validValue);
                formData.append(`activities[${index}].activityDifficulty`, activity.activityDifficulty || 'EASY');
            });
            if (codeTarget) formData.append('calygamCode', codeTarget);
            console.log('FormData enviado:', Array.from(formData.entries()));

            const response = await axios.post(
                // 'https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/trail/create'
                'http://10.0.0.191:8080/trail/create',
                formData,
                {

                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )
            console.log('criarTrilha response:', response.data);
            Alert.alert('Sucesso', 'Trilha criada com sucesso!')
            setBottomSheetOpen(false)
            navigation.goBack();
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
                        <Text style={styles.label}>Senha da Trilha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite a senha da trilha"
                            placeholderTextColor="#888"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={false}  // ← Adicione para ocultar senha
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
                            <TouchableOpacity onPress={pickImage} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5, borderColor: '#FFF', borderWidth: 2, padding: 10, borderRadius: 18 }}>
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
                        <TouchableOpacity style={styles.confirmButton} onPress={handleOpenActivityModal}>
                            <Text style={styles.confirmText}>Criar Trilha</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheet>

                {/* Modal de Atividades */}
                <BottomSheet
                    ref={activitySheetRef}
                    snapPoints={['40%', '80%']}
                    index={-1}
                    enablePanDownToClose={true}
                    backgroundStyle={{ backgroundColor: '#0D141C' }}
                >
                    <BottomSheetView style={styles.modalContent}>
                        <StepBottomSheetContent onSave={handleSaveActivities} />
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
        color: '#FFF',
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
        color: '#000',
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
        color: '#fff',
        backgroundColor: '#0D141C',
    },
    label: {
        color: '#FFF',
        marginBottom: 5,
        marginTop: 10
    }

})