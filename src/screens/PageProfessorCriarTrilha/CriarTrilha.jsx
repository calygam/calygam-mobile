import { View, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native'
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import IconAdicionar from "../../../assets/svg/adicionar.svg";
import IconImage from "../../../assets/svg/image-plus.svg";
import IconUpload from "../../../assets/svg/upload-cloud-02.svg";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { StepBottomSheetContent } from '../../components/ModalAtividadeProf/ModalAtividade';
import { useTrilhaForm } from '../../hooks/useTrilhaForm'
import { useTrilhaApi } from '../../hooks/useTrilhaApi'
import ListarTrilhasCriadas from '../../components/ListarTrilhasCriadas/ListarTrilhasCriadas'
import ModalPublicandoTrilha from '../../components/ModalPublicandoTrilha/ModalPublicandoTrilha'
import IconsDropdown from '../../components/IconsModal/IconsDropdown'
import IconSelector, { iconMap } from '../../components/IconsModal/Icons'
import styles from './CriarTrilha.styles'
import AsyncStorage from '@react-native-async-storage/async-storage'


export default function CriarTrilha() {
    const navigation = useNavigation()
    const {
        nome, setNome,
        senha, setSenha,
        vagas, setVagas,
        descricao, setDescricao,
        image, setImage,
        activities, setActivities,
        pickImage,
        validateForm,
        resetForm,
        loadFormData,
    } = useTrilhaForm()

    const {
        userId,
        createdTrails,
        criarTrilha: apiCriarTrilha,
        updateTrilha: apiUpdateTrilha,
        fetchCreatedTrails,
    } = useTrilhaApi()

    const [isEditing, setIsEditing] = useState(false);
    const [editingTrail, setEditingTrail] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIconName, setSelectedIconName] = useState(null);
    const [professorPhoto, setProfessorPhoto] = useState(null);
    const [status, setStatus] = useState('ENABLE');
    const [publishingTrail, setPublishingTrail] = useState(null);
    const [publishVisible, setPublishVisible] = useState(false);

    const snapPoints = useMemo(() => ['55%', '100%'], [])
    const bottomSheetRef = useRef(null) // modal de criar/editar
    const activitySheetRef = useRef(null) // modal de atividades

    // Carrega a foto do professor (a mesma do modal de perfil)
    useEffect(() => {
        const loadUserPhoto = async () => {
            try {
                const info = await AsyncStorage.getItem('userInfo');
                if (info) {
                    const parsed = JSON.parse(info);
                    setProfessorPhoto(parsed?.photoURL || null);
                }
            } catch (e) {
                // silencioso
            }
        };
        loadUserPhoto();
    }, []);

    const handleOpenActivityModal = () => {
        if (!validateForm()) return;
        // Fecha o modal de criação e abre o de atividades
        bottomSheetRef.current?.dismiss();
        setTimeout(() => {
            activitySheetRef.current?.present();
        }, 250);
    }

    const handleSaveActivities = (savedActivities) => {
        setActivities(savedActivities);
        activitySheetRef.current?.dismiss();
        if (isEditing) {
            updateTrilha(savedActivities);
        } else {
            criarTrilha(savedActivities);
        }
    };

    const criarTrilha = async (activitiesOverride) => {
        // DEBUG: garantir que o status atual é o que o usuário escolheu antes de montar o FormData
        console.log('[CRIAR] status state antes de enviar:', status);
        const activitiesToSend = Array.isArray(activitiesOverride) ? activitiesOverride : activities;
        if (!activitiesToSend || activitiesToSend.length < 10) {
            Alert.alert('Erro', 'É necessário ter pelo menos 10 atividades antes de criar a trilha.');
            return;
        }

        const formData = new FormData();
        formData.append('trailName', nome.trim());
        formData.append('trailDescription', descricao.trim());
        formData.append('trailPrice', 0);


        // Sempre enviar uma imagem: real ou placeholder
        let imageToSend;
        if (image) {
            imageToSend = {
                uri: image,
                name: 'trilha.jpg',
                type: 'image/jpeg',
            };
        } else {
            // Enviar placeholder quando ícone selecionado ou nada
            imageToSend = {
                uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                name: 'placeholder.png',
                type: 'image/png',
            };
        }
        formData.append('trailFileImage', imageToSend);

        formData.append('trailIcon', selectedIconName || '');
        console.log("ICON ENVIADO PRO BACK:", selectedIconName);

        formData.append('trailPassword', (senha || '').trim());

        formData.append('trailVacancy', Number(vagas));
        activitiesToSend.forEach((activity, index) => {
            if (activity.activityId) {
                formData.append(`activities[${index}].activityId`, String(activity.activityId));
            }
            formData.append(`activities[${index}].activityName`, (activity.activityName || '').trim());
            formData.append(`activities[${index}].activityDescription`, (activity.activityDescription || '').trim());
            const rawActPts = String(activity.activityPrice || 0).replace(/[^0-9]/g, '');
            const intValue = parseInt(rawActPts, 10);
            const validValue = isNaN(intValue) ? 0 : intValue;
            formData.append(`activities[${index}].activityPrice`, validValue);
            const difficulty = (activity.activityDifficulty || 'EASY').toString().trim().toUpperCase();
            formData.append(`activities[${index}].activityDifficulty`, difficulty);
        });

        const result = await apiCriarTrilha(formData);
        if (result) {
            resetForm();
            navigation.goBack();
        }
    };

    const updateTrilha = async (activitiesOverride) => {
        console.log('[UPDATE] status state antes de enviar:', status);
        const activitiesToSend = Array.isArray(activitiesOverride) ? activitiesOverride : activities;
        if (!activitiesToSend || activitiesToSend.length < 10) {
            Alert.alert('Erro', 'É necessário ter pelo menos 10 atividades.');
            return;
        }

        const formData = new FormData();
        formData.append('trailName', nome.trim());
        formData.append('trailDescription', descricao.trim());
        formData.append('trailPrice', 0);
        // formData.append('trailStatus', String(status).toUpperCase());
        // Manda de 3 jeitos diferentes — um deles VAI pegar
        formData.append('trailStatus', status);
        formData.append('status', status);
        formData.append('trailStatus', status.toUpperCase());
        console.log('[UPDATE] trailStatus enviado no FormData:', String(status).toUpperCase());


        // Sempre enviar uma imagem: real ou placeholder
        let imageToSend;
        if (image) {
            imageToSend = {
                uri: image,
                name: 'trilha.jpg',
                type: 'image/jpeg',
            };
        } else {
            // Enviar placeholder quando ícone selecionado ou nada
            imageToSend = {
                uri: Image.resolveAssetSource(require('../../../assets/svg/placeholderOI.png')).uri,
                name: 'placeholder.png',
                type: 'image/png',
            };
        }
        formData.append('trailFileImage', imageToSend);

        formData.append('trailIcon', selectedIconName || '');
        formData.append('trailPassword', (senha || '').trim());

        formData.append('trailVacancy', Number(vagas));
        activitiesToSend.forEach((activity, index) => {
            if (activity.activityId) {
                formData.append(`activities[${index}].activityId`, String(activity.activityId));
            }
            formData.append(`activities[${index}].activityName`, (activity.activityName || '').trim());
            formData.append(`activities[${index}].activityDescription`, (activity.activityDescription || '').trim());
            const rawActPts = String(activity.activityPrice || 0).replace(/[^0-9]/g, '');
            const intValue = parseInt(rawActPts, 10);
            const validValue = isNaN(intValue) ? 0 : intValue;
            formData.append(`activities[${index}].activityPrice`, validValue);
            const difficulty = (activity.activityDifficulty || 'EASY').toString().trim().toUpperCase();
            formData.append(`activities[${index}].activityDifficulty`, difficulty);
        });

        const result = await apiUpdateTrilha(editingTrail.trailId, formData);
        if (result) {
            setIsEditing(false);
            setEditingTrail(null);
            resetForm();
            fetchCreatedTrails(userId);
        }
    };

    const handlePresentModalPress = () => {
        setIsEditing(false);
        setEditingTrail(null);
        resetForm();
        setSelectedIconName(null);
        setStatus('ENABLE');
        bottomSheetRef.current?.present();
    }

    const handleCloseModal = () => {
        bottomSheetRef.current?.dismiss();
        setIsEditing(false);
        setEditingTrail(null);
    }

    const handlePublishRequest = (trail) => {
        setPublishingTrail(trail);
        setPublishVisible(true);
    };

    const onEdit = (item) => {
        setEditingTrail(item);
        setIsEditing(true);
        loadFormData(item);
        setSelectedIconName(item.trailIcon || null);

        const rawStatus = item?.trailStatus ?? item?.status ?? 'BUILDING';
        let correctStatus = 'BUILDING';

        if (typeof rawStatus === 'number') {
            if (rawStatus === 0) correctStatus = 'ENABLE';
            else if (rawStatus === 1) correctStatus = 'DESABLED';
            else if (rawStatus === 5) correctStatus = 'BUILDING';
        } else if (typeof rawStatus === 'string') {
            const upper = rawStatus.toUpperCase();
            if (upper === 'ENABLE' || upper === 'ATIVO') correctStatus = 'ENABLE';
            if (upper === 'DESABLED' || upper === 'DESATIVO') correctStatus = 'DESABLED';
            if (upper === 'BUILDING' || upper === 'CONSTRUINDO') correctStatus = 'BUILDING';
        }

        console.log("[onEdit] Status resolvido:", correctStatus);
        setStatus(correctStatus);

        // **AQUI ESTÁ A CORREÇÃO FUNDAMENTAL**
        setTimeout(() => {
            bottomSheetRef.current?.present();
        }, 200);
    };

    return (

        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: '#021713' }}>
                <View style={styles.container}>
                    {/* Texto Criar Trilha */}
                    <View style={{ color: '#FFF' }}>
                        <Text style={{ color: '#FFF' }}>Minhas Trilhas</Text>
                    </View>

                    {/* Se não tiver trilhas criadas, mostrar isso */}
                    {createdTrails.length === 0 && (
                        <View
                            style={{
                                backgroundColor: '#6b63ff55', // Fundo escuro similar ao da imagem
                                borderWidth: 1, // Espessura da borda
                                borderColor: '#736de5ff', // Cor da borda (azul claro; ajuste conforme necessário)
                                borderStyle: 'dashed', // Estilo tracejado
                                borderRadius: 10, // Raio para bordas arredondadas
                                padding: 30, // Espaçamento interno
                                alignItems: 'center', // Alinhamento central
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontSize: 18, marginBottom: 10 }}>
                                Nenhuma trilha encontrada
                            </Text>
                            <Text style={{ color: '#6C63FF', fontSize: 14, marginBottom: 20 }}>
                                Clique no + para criar sua primeira!
                            </Text>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#6C63FF', // Cor do botão +
                                    borderRadius: 50, // Botão circular
                                    width: 40,
                                    height: 40,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '200' }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                    {/* Cards de Trilhas Criadas */}
                    <ListarTrilhasCriadas createdTrails={createdTrails} onEdit={onEdit} onPublish={handlePublishRequest} professorPhoto={professorPhoto} />

                    {/* Botão de Add */}
                    <View style={{ position: 'absolute', bottom: 110, right: 30 }}>
                        <TouchableOpacity onPress={handlePresentModalPress} style={{ backgroundColor: '#6C63FF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}>
                            <IconAdicionar width={20} height={30} />
                        </TouchableOpacity>
                    </View>

                    {/* Modal (BottomSheet) */}
                    <BottomSheetModal
                        ref={bottomSheetRef}
                        snapPoints={snapPoints}
                        enablePanDownToClose={true}
                        backgroundStyle={{ backgroundColor: '#0D141C' }}
                        style={{ zIndex: 100 }}
                    >
                        <BottomSheetScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Editar Trilha' : 'Criar Nova Trilha'}</Text>

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
                                secureTextEntry={false}
                            />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                <View style={{ width: 55, height: 55, backgroundColor: '#F5F5F5', borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10, flexDirection: 'row' }}>
                                    {(() => {
                                        const SelectedIcon = selectedIconName ? iconMap[selectedIconName] : null;
                                        return SelectedIcon ? (
                                            <SelectedIcon width={35} height={35} />
                                        ) : image ? (
                                            <Image source={{ uri: image }} style={{ width: 50, height: 50, borderRadius: 30 }} />
                                        ) : (
                                            IconImage ? <IconImage width={40} height={40} /> : null
                                        );
                                    })()}
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    {/* Dropdown de Ícones - estilo quadrado com seta */}
                                    <IconsDropdown
                                        selectedKey={selectedIconName}
                                        onSelect={(name) => {
                                            setSelectedIconName(name);
                                            setImage(null);
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={async () => {
                                            await pickImage();
                                            setSelectedIconName(null); // ✅ limpar ícone quando enviar imagem
                                        }}
                                        style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5, borderColor: '#FFF', borderWidth: 2, padding: 10, borderRadius: 18 }}
                                    >
                                        {IconUpload ? <IconUpload width={30} height={30} /> : null}
                                        <Text style={{ color: '#FFF', fontSize: 14 }}>Adicionar Imagem</Text>
                                    </TouchableOpacity>

                                </View>
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
                                <Text style={styles.confirmText}>{isEditing ? 'Editar Atividades' : 'Continuar'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </BottomSheetScrollView>
                    </BottomSheetModal>

                    {/* Modal de Atividades */}
                    <BottomSheetModal
                        ref={activitySheetRef}
                        snapPoints={['60%', '95%']}
                        enablePanDownToClose={true}
                        keyboardBehavior="extend"
                        keyboardBlurBehavior="restore"
                        backgroundStyle={{ backgroundColor: '#0D141C' }}
                        style={{ zIndex: 110 }}
                    >
                        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                            <StepBottomSheetContent onSave={handleSaveActivities} isEditing={isEditing} initialActivities={activities} />
                        </BottomSheetScrollView>
                    </BottomSheetModal>
                </View>
            </View>
            <IconSelector visible={modalVisible} onSelectIcon={(name) => { setSelectedIconName(name); setImage(null); }} onClose={() => setModalVisible(false)} />

            {/* Modal Publicar Trilha (overlay) */}
            <ModalPublicandoTrilha
                visible={publishVisible}
                trail={publishingTrail}
                onClose={() => { setPublishVisible(false); setPublishingTrail(null); }}
                onPublish={async (code) => {
                    if (!publishingTrail) return;
                    try {
                        const formData = new FormData();
                        formData.append('calygamCode', code);
                        const result = await apiUpdateTrilha(publishingTrail.trailId, formData);
                        if (result) {
                            await fetchCreatedTrails(userId);
                            setPublishVisible(false);
                            setPublishingTrail(null);
                        }
                    } catch (e) {
                        Alert.alert('Erro', 'Falha ao publicar trilha');
                    }
                }}
            />
        </GestureHandlerRootView>

    )
}