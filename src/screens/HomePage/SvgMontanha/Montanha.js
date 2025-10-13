// src/screens/HomePage/SvgMontanha/Montanha.js
import React from "react";
import Montanha from "../../../../assets/svg/group-146.svg"; // OBS: o nome aqui NÃO pode ser igual ao nome da função
import { StyleSheet } from "react-native";

export default function CUzinho({ Monta }) {
    return (
        <Montanha width={'100%'} fill="#888" style={styles.icon} />
    )
}

const styles = StyleSheet.create({
    icon: {
        width: '100%',
        // backgroundColor: 'green'
    }
})