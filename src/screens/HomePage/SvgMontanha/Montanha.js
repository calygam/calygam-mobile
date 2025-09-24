// src/screens/HomePage/SvgMontanha/Montanha.js
import React from "react";
import MontanhaSvg from "../../../../assets/Svg/Group 146.svg"; // OBS: o nome aqui NÃO pode ser igual ao nome da função

export default function Montanha(props) {
    const { width = 350, height = 350, style, ...rest } = props;
    return <MontanhaSvg width={width} height={height} style={style} {...rest} />;
}

