import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import IconSeach from "../../../assets/svg/IconsInterface/icon_seach.svg";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window')

export default function SearchBar() {
    return (
        <View style={styles.container}>
            <IconSeach width={24} height={24} fill="#888" style={styles.icon} />
            <TextInput
                placeholder="Pesquisar Trilha:"
                placeholderTextColor="#b4b3b3ff"
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        height: 50,
        width: width * 0.7,
        backgroundColor: '#000',
        borderRadius: 20,
        paddingHorizontal: 15,
        flexDirection: 'row',
        borderColor: '#D9D9D933',
        borderWidth: 2,
    },
    icon: {
        marginRight: 8,
    },
    input: {

        fontSize: 14,
        color: "#ffffffff",
        fontWeight: '100',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});