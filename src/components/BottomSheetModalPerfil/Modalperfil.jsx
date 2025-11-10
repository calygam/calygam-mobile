import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Ajuste o caminho se necessário
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import CircularLoader from '../LoadingCircular/Loading';

const Modal = () => {
    const navigation = useNavigation();
    // ref
    const bottomSheetModalRef = useRef(null);
    const snapPoints = useMemo(() => ["40%", "80%"], [])

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Carrega usuário do AsyncStorage
    useEffect(() => {
        const loadUser = async () => {
            try {
                await AsyncStorage.removeItem("userInfo");
                const userInfo = await AsyncStorage.getItem("userInfo");

                if (userInfo) {
                    setUser(JSON.parse(userInfo));
                    setLoading(false);
                    return;
                }

                const token = await AsyncStorage.getItem("userToken");
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Primeiro: tentar buscar o perfil no backend (ajuste endpoint se necessário)
                try {
                    const resp = await axios.get("http://10.0.0.191:8080/users/readOne", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const serverUser = resp.data.user ?? resp.data;
                    const ui = {
                        uid: serverUser?.userId,
                        displayName: serverUser?.userName || 'Usuário',
                        email: serverUser?.userEmail || '',
                        photoURL: serverUser?.userImage || null,
                        xp: serverUser?.userXp || 0,
                        rank: serverUser?.userRank || '',
                        money: serverUser?.userMoney || 0,
                        food: serverUser?.userFood || 0
                    };
                    setUser(ui);
                    await AsyncStorage.setItem("userInfo", JSON.stringify(ui));
                    setLoading(false);
                    return;
                } catch (error) {
                    console.log("Erro ao buscar usuário do servidor:", error);
                }
            } catch (error) {
                Alert.alert("Erro", "Não foi possível carregar os dados do usuário");
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);


    const handleCloseAction = () => bottomSheetModalRef.current?.dismiss();
    const handleOpenPress = () => bottomSheetModalRef.current?.present();

    if (loading) {
        return (
            <GestureHandlerRootView style={styles.container}>
                <CircularLoader size={20} strokeWidth={3} color="#007AFF" />
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
                    source={user?.photoURL ? { uri: user.photoURL } : require('../../../assets/image/SemPerfil.jpeg')}
                    style={{ width: '100%', height: '100%', backgroundColor: '#FFF' }}
                />
            </TouchableOpacity>


            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                index={1}
                backgroundStyle={{ backgroundColor: '#0D141C' }}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, color: '#ffffffff' }}>Perfil</Text>
                        <Button title='Fechar' onPress={handleCloseAction} />
                    </View>


                    {/* Profile Info */}
                    <Image
                        source={user?.photoURL ? { uri: user.photoURL } : require('../../../assets/image/SemPerfil.jpeg')}
                        style={styles.profileImage}
                    />

                    <Text style={styles.userName}>Nome: {user?.displayName || 'Usuário'}</Text>
                    <Text style={styles.userEmail}>Email: {user?.email || 'Não disponível'}</Text>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Status */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.xp || 40}</Text>
                            <Text style={styles.statLabel}>XP</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.rank || "NOVATO"}</Text>
                            <Text style={styles.statLabel}>Rank</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.money || 0}</Text>
                            <Text style={styles.statLabel}>Dinheiro</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.food || 0}</Text>
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
});

export default Modal;