import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Dimensions } from 'react-native'
import IconPessoas from "../../../assets/svg/IconsInterface/users-alt-1.svg";
import { Image } from 'react-native';

// novos imports de ícones (adicione/ajuste conforme seus arquivos)
import IconReact from "../../../assets/svg/IconsInterface/react-1.svg";
import IconBancoDeDados from "../../../assets/svg/IconsInterface/base-de-dados-1.svg";
import IconFront from "../../../assets/svg/IconsInterface/codigo-simples-1.svg";
import IconGroup from "../../../assets/svg/IconsInterface/group.svg";
import IconIllustrator from "../../../assets/svg/IconsInterface/illustrator-1.svg";

const { width, height } = Dimensions.get('window')

export default function CardsTrilhas({ NameTrail, Icons, vacanciesTrail, ImageTrail }) {
    // mapa para converter strings em componentes SVG
    const ICONS_MAP = {
        // chaves normalizadas (sem espaços/traços/pontos)
        react: IconReact,
        'react-1': IconReact,
        'base-de-dados': IconBancoDeDados,
        'basededados': IconBancoDeDados,
        banco: IconBancoDeDados,
        db: IconBancoDeDados,
        front: IconFront,
        'codigo-simples': IconFront,
        group: IconGroup,
        java: IconGroup,
        illustrator: IconIllustrator,
        'illustrator-1': IconIllustrator,
        users: IconPessoas,
        'users-alt-1': IconPessoas,
    };

    // resolve o componente de ícone a partir da prop Icons
    let IconComponent = IconPessoas; // fallback
    if (typeof Icons === 'string') {
        const normalized = Icons.toString().toLowerCase().replace(/[\s_\-\.]/g, '');
        // tenta encontrar pelo nome normalizado ou pelo valor original em lowercase
        IconComponent = ICONS_MAP[normalized] ?? ICONS_MAP[Icons.toLowerCase()] ?? IconPessoas;
    } else if (Icons) {
        // se vier um componente React (função/classe), usa direto
        IconComponent = Icons;
    }

    return (
        <View style={styles.container}>
            <View style={styles.BoxCard}>

                {/* Renderiza a imagem corretamente usando <Image> em vez de inserir string dentro de <View> */}
                <View style={styles.FotoTrilha}>
                    {ImageTrail ? (
                        <Image source={{ uri: ImageTrail }} style={{ width: '100%', height: '100%', borderRadius: 15 }} resizeMode="cover" />
                    ) : null}
                </View>

                <View style={styles.Infomações}>
                    <View>
                        <Text style={styles.TextTrilha} > Trilha </Text>
                    </View>

                    <Text style={styles.title}>{NameTrail}</Text>

                    <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                        <IconPessoas width={15} height={24} fill="#fff" />
                        <Text style={{ color: '#FFF', fontSize: 12 }}>45/{vacanciesTrail}</Text>
                    </View>

                </View>

                <View style={styles.FotoIconTrilha}>
                    <IconComponent width={24} height={24} fill="#fff" />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0D1912',
        borderWidth: 2,
        borderColor: '#FFF',
        width: width * 0.9,
        height: 'auto',
        borderRadius: 20,
        justifyContent: 'center',
        padding: 11,
    },
    BoxCard: {
        flexDirection: 'row',
        gap: 10,
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center'
    },
    FotoTrilha: {
        width: 50,
        height: 50,
        backgroundColor: '#962a2aff',
        borderRadius: 15
    },
    Infomações: {
        // backgroundColor: '#0089ED',
        width: '57%',
        height: 65,
    },
    FotoIconTrilha: {
        backgroundColor: '#6C63FF',
        height: 50,
        width: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    TextTrilha: {
        color: '#6C63FF'
    },
    title: {
        color: '#FFF',
        fontWeight: '200',
        fontSize: 15

    }
})