import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Ajuste o caminho se necessário
import jwtDecode from 'jwt-decode';
import axios from 'axios';

const Modal = () => {
    const navigation = useNavigation();
    // ref
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ["40%", "80%"], [])

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Carrega usuário do AsyncStorage
    useEffect(() => {
        const loadUser = async () => {
            try {
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
                        uid: serverUser?.id ?? serverUser?.userId ?? null,
                        displayName: serverUser?.user_name ?? serverUser?.username ?? serverUser?.nome ?? serverUser?.name ?? serverUser?.email ?? 'Usuário',
                        email: serverUser?.email ?? '',
                        photoURL: serverUser?.photoURL ?? null,
                    };
                    setUser(ui);
                    await AsyncStorage.setItem("userInfo", JSON.stringify(ui));
                    setLoading(false);
                    return;
                } catch (err) {
                    console.warn('Falha fetch /users/readOne:', err.message);
                    // fallback: decodifica token e tenta pegar user_name do payload
                    try {
                        const decoded = jwtDecode(token);
                        const ui = {
                            uid: decoded.userId ?? decoded.id ?? null,
                            displayName: decoded.user_name ?? decoded.username ?? decoded.name ?? decoded.email ?? 'Usuário',
                            email: decoded.email ?? '',
                            photoURL: decoded.picture ?? null,
                        };
                        setUser(ui);
                        await AsyncStorage.setItem("userInfo", JSON.stringify(ui));
                    } catch (e) {
                        console.warn('Falha ao decodificar token:', e.message);
                    }
                }
            } catch (error) {
                Alert.alert("Erro", "Não foi possível carregar os dados do usuário");
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);


    const handleCloseAction = () => bottomSheetRef.current?.close();
    const handleOpenPress = () => bottomSheetRef.current?.expand();

    if (loading) {
        return (
            <GestureHandlerRootView style={styles.container}>
                <Text>Carregando...</Text>
            </GestureHandlerRootView>
        );
    }

    // Função de logout
    const handleLogout = async () => {
        try {
            // Limpar o estado do usuário
            setUser(null);
            await GoogleSignin.signOut();
            await signOut(auth); // ← Adicione isso para deslogar do Firebase
            // Limpar o AsyncStorage
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userInfo");

            // Remova o navigation.dispatch aqui, pois o Firebase vai cuidar da navegação
            Alert.alert("Sucesso", "Você saiu da sua conta.");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível sair da conta");
        }
    };

    return (

        <GestureHandlerRootView style={styles.container}>

            <TouchableOpacity onPress={handleOpenPress} style={{ width: 50, height: 50, overflow: 'hidden', borderRadius: 100 }}>
                <Image source={{ uri: user?.photoURL }} style={{ width: '100%', height: '100%' }} />
            </TouchableOpacity>


            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={-1}
                enablePanDownToClose={true}
                enableContentPanningGesture={false}
                enableContentPanning={false}
                backgroundStyle={{ backgroundColor: '#0D141C' }}

            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, color: '#ffffffff' }}>Perfil</Text>
                        <Button title='Fechar' onPress={handleCloseAction} />
                    </View>


                    {/* Profile Info */}
                    <Image
                        source={{ uri: user?.photoURL || "https://via.placeholder.com/100" }}
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
            </BottomSheet>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        paddingTop: 60,
        paddingLeft: 20,
        position: 'absolute',
        zIndex: 1,
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