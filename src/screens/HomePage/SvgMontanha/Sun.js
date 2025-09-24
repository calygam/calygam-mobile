// src/screens/HomePage/SvgMontanha/Montanha.js
import React from "react";
import SunSvg from "../../../../assets/Svg/Sun.svg"; // OBS: o nome aqui NÃO pode ser igual ao nome da função

export default function Sun(props) {
    const { width = 188, height = 188, style, ...rest } = props;
    return <SunSvg width={width} height={height} style={style} {...rest} />;
}

