import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Modal = () => {
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

    // renders
    return (
        
        <GestureHandlerRootView style={styles.container}>

            <TouchableOpacity onPress={handleOpenPress} style={{ width: 60, height: 60, backgroundColor: 'blue', borderRadius: 100}}/>
            
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={1}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: '#FFF' }}
                
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30 }}> Perfil </Text>
                    <Text style={styles.userName}>Nome: {user?.displayName || 'Usuário'}</Text>
                    <Text style={styles.userEmail}>Email: {user?.email || 'Não disponível'}</Text>

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

                    <Button title='Fechar' onPress={handleCloseAction} />
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
        color: '#1a1a1a',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
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
        color: '#888',
        marginTop: 4,
    },
});

export default Modal;