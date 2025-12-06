import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const App = () => {
    // ref
    const bottomSheetRef = useRef(null);

    // snap points (obrigatório)
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    // callbacks
    const handleSheetChanges = useCallback((index) => {
        console.log("handleSheetChanges", index);
    }, []);

    const openSheet = () => {
        bottomSheetRef.current?.expand();
    };

    const closeSheet = () => {
        bottomSheetRef.current?.close();
    };

    return (
        <GestureHandlerRootView style={{ flex: 1, }}>
            <View style={styles.container}>
                {/* Botões */}
                <TouchableOpacity style={styles.button} onPress={openSheet}>
                    <Text style={styles.buttonText}>Abrir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.closeButton]}
                    onPress={closeSheet}
                >
                    <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>

                {/* Bottom Sheet */}
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    index={-1} // começa fechado
                    onChange={handleSheetChanges}
                    enablePanDownToClose={true}
                    bottomInset={100}
                    detached={true}
                    style={styles.sheetContainer}
                    
                >
                    <BottomSheetView style={styles.contentContainer}>
                        <Text>Awesome 🎉</Text>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "grey",
        padding: 24,
    },
    button: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    closeButton: {
        backgroundColor: "#dc2626",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: "center",
        justifyContent: "center",
       
        
    },
    sheetContainer: {
        // add horizontal space
        marginHorizontal: 24,
        backgroundColor: "#0055ffff",
       
    },
});

export default App;
