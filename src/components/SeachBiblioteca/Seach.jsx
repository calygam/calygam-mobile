import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import IconSeach from "../../../assets/Svg/IconsInterface/Icon Seach.svg";

export default function SearchBar() {
    return (
        <View style={styles.container}>
            <IconSeach width={24} height={24} fill="#888" style={styles.icon} />
            <TextInput
                placeholder="Pesquisar Trilha:"
                placeholderTextColor="#888"
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        height: 50,
        width: 235
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#000",
        fontWeight: '100',
    },
});