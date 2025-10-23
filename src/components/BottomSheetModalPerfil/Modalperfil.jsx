import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native';

const Modal = () => {
    // ref
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ["40%", "80%"], [])

    // callbacks
    const handleSheetChanges = useCallback((index) => {
        console.log('handleSheetChanges', index);
    }, []);

    const handleCloseAction = () => bottomSheetRef.current?.close();
    const handleOpenPress = () => bottomSheetRef.current?.expand();


    // renders
    return (
        
        <GestureHandlerRootView style={styles.container}>

            <TouchableOpacity onPress={handleOpenPress} style={{ width: 60, height: 60, backgroundColor: 'blue', borderRadius: 100}}/>

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={1}
                onChange={handleSheetChanges}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: '#FFF' }}
                
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Text>Awesome 🎉</Text>
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
        position: 'absolute'
    },
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',

    },
});

export default Modal;