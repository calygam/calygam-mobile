import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import CircularLoader from '../LoadingCircular/Loading';
import api from '../../api/api';
import * as ImagePicker from 'expo-image-picker';

const Modal = () => {
    const navigation = useNavigation();
    // ref
    const bottomSheetModalRef = useRef(null);
    const snapPoints = useMemo(() => ["40%", "80%"], [])

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Carrega usuário do AsyncStorage e sempre do backend para atualizar
    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            try {
                const userInfo = await AsyncStorage.getItem("userInfo");
                if (userInfo) {
                    setUser(JSON.parse(userInfo)); // Mostra dados locais primeiro
                }

                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Sempre buscar do backend para atualizar dados (o interceptor já adiciona Authorization)
                try {
                    const resp = await api.get('/users/readOne');
                    const serverUser = resp.data.user ?? resp.data;
                    setUser(serverUser);
                    await AsyncStorage.setItem('userInfo', JSON.stringify(serverUser));
                    setLoading(false);
                } catch (error) {
                    console.log('Erro ao buscar usuário do servidor:', error);
                    // Se erro, mantém dados locais se existirem
                    if (!userInfo) {
                        setLoading(false);
                    }
                }
            } catch (error) {
                Alert.alert("Erro", "Não foi possível carregar os dados do usuário");
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // Função para selecionar imagem
    const pickImage = async () => {
        // Pedir permissões
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar uma imagem.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const file = result.assets[0];
            console.log('Imagem selecionada:', file); // Debug: verificar URI e campos
            // Validações
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.fileSize > maxSize) {
                Alert.alert('Arquivo muito grande', 'Selecione uma imagem menor que 5MB.');
                return;
            }
            setSelectedImage(file);
        }
    };

    // Log de debugging - cheque se o GET funciona do device/emulador
    const debugCheckReachability = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            console.log('baseURL =', api?.defaults?.baseURL);
            const r = await api.get('/users/readOne');
            console.log('GET /users/readOne OK', r.status);
        } catch (err) {
            console.log('GET /users/readOne ERRO', err);
        }
    };
    useEffect(() => {
        debugCheckReachability();
    }, []);

    // Função para fazer upload da imagem
    // Ela tenta fetch primeiro (mais robusto no RN) e cai para axios se necessário.
    // Garante normalizar name/type e envia Authorization explicitamente.

    // Não guardamos token em estado aqui; pegamos direto do AsyncStorage quando necessário

    const uploadImage = async () => {
        if (!selectedImage) return;
        setUploading(true);

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Erro', 'Token inválido. Faça login novamente.');
                setUploading(false);
                return;
            }

            // Normaliza o token (remove possível prefixo 'Bearer ' salvo no storage)
            const rawToken = typeof token === 'string' && token.startsWith('Bearer ') ? token.slice(7) : token;
            const authHeader = `Bearer ${rawToken}`;

            // Normaliza infos do arquivo (baseado no log que você enviou)
            const uri = selectedImage.uri;
            const uriParts = uri.split('/');
            const fileName = selectedImage.fileName || uriParts[uriParts.length - 1] || 'profile.jpg';
            
            const mimeType = selectedImage.mimeType || selectedImage.type || 'image/jpeg';

            // Monta FormData
            const formData = new FormData();
            formData.append('userMultipartFile', {
                uri,
                name: fileName,
                type: mimeType,
            });
            // envia campos textuais esperados pelo DTO. Enviamos strings vazias quando não queremos alterar
            formData.append('userName', user?.userName || '');
            formData.append('userEmail', '');
            formData.append('userPassword', '');
            formData.append('userNewPassword', '');

            
            const base = (api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL.replace(/\/$/, '') : '';
            const url = base ? `${base}/users/editOne` : `/users/editOne`;

            
            try {
                const resp = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        Authorization: authHeader,
                    },
                    body: formData,
                });

                if (!resp.ok) {
                    const text = await resp.text().catch(() => null);
                    throw new Error(`HTTP ${resp.status}: ${text ?? 'sem corpo'}`);
                }

                // Se backend retorna JSON com sucesso
                const json = await resp.json().catch(() => null);
                console.log('Upload com fetch OK', json);

                // Recarrega user do servidor (o interceptor adiciona Authorization)
                const respUser = await api.get('/users/readOne');
                const updatedUser = respUser.data.user ?? respUser.data;
                setUser(updatedUser);
                await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
                setSelectedImage(null);
                return;
            } catch (fetchErr) {
                console.error('Upload com fetch falhou:', fetchErr);
                Alert.alert('Erro', 'Não foi possível enviar a imagem. Verifique a conexão e tente novamente.');
                throw fetchErr;
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
        } finally {
            setUploading(false);
        }
    };


    const handleCloseAction = () => bottomSheetModalRef.current?.dismiss();
    const handleOpenPress = () => bottomSheetModalRef.current?.present();

    if (loading) {
        return (
            <GestureHandlerRootView style={styles.container}>
                <CircularLoader size={20} strokeWidth={2} color="#007AFF" />
            </GestureHandlerRootView>
        );
    }

    // Função de logout
    const handleLogout = async () => {
        try {
            // Desloga dos provedores
            await GoogleSignin.signOut();
            await signOut(auth);

            // Limpa storage usado pelo app
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
            await AsyncStorage.removeItem("currentTrailId");
            await AsyncStorage.removeItem("joinedTrail");
            await AsyncStorage.removeItem("trailProgress");


            // Limpa estado local
            setUser(null);

            // Fecha modal se aberto
            bottomSheetModalRef.current?.dismiss();

            // Reseta a navegação para tela de Login
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );

            Alert.alert('Sucesso', 'Você saiu da sua conta.');
        } catch (error) {
            console.log('Erro logout', error);
            Alert.alert('Erro', 'Não foi possível sair da conta');
        }
    };

    return (

        <GestureHandlerRootView style={styles.container}>

            <TouchableOpacity onPress={handleOpenPress} style={{ width: 50, height: 50, overflow: 'hidden', borderRadius: 100 }}>
                <Image
                    source={user?.userImage ? { uri: user.userImage } : require('../../../assets/image/SemPerfil.jpeg')}
                    style={{ width: '100%', height: '100%', backgroundColor: '#FFF' }}
                />
            </TouchableOpacity>


            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                index={1}
                backgroundStyle={{ backgroundColor: '#0D141C' }}
                handleIndicatorStyle={{ backgroundColor: '#FFF' }}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, color: '#ffffffff' }}>Meu Perfil</Text>
                        <Button title='Fechar' onPress={handleCloseAction} />
                    </View>


                    {/* Profile Info */}
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={selectedImage ? { uri: selectedImage.uri } : (user?.userImage ? { uri: user.userImage } : require('../../../assets/image/SemPerfil.jpeg'))}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    <Text style={{ color: '#E5E5E5', fontSize: 12, marginBottom: 10 }}>Toque na imagem para alterar</Text>

                    {selectedImage && (
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                            <TouchableOpacity style={styles.saveButton} onPress={uploadImage} disabled={uploading}>
                                <Text style={styles.saveText}>{uploading ? 'Salvando...' : 'Salvar Foto'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedImage(null)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text style={styles.userName}>Nome: {user?.userName || user?.userEmail || 'Usuário'}</Text>
                    <Text style={styles.userEmail}>Email: {user?.userEmail || 'Não disponível'}</Text>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Status */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.userXp || 0}</Text>
                            <Text style={styles.statLabel}>XP</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.userRank || "NOVATO"}</Text>
                            <Text style={styles.statLabel}>Rank</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.userMoney || 0}</Text>
                            <Text style={styles.statLabel}>Dinheiro</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.userFood || 0}</Text>
                            <Text style={styles.statLabel}>Comida</Text>
                        </View>
                    </View>


                </BottomSheetView>
            </BottomSheetModal>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 'auto',
        height: 'auto',
       
    },
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',

    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#E5E5E5',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#ddd',
        marginVertical: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#E5E5E5',
        marginTop: 4,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cancelButton: {
        backgroundColor: '#666',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    cancelText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default Modal;