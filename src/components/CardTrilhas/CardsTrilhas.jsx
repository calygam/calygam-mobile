import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import { iconMap } from '../IconsModal/Icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import IconPessoas from "../../../assets/svg/IconsInterface/users-alt 2.svg";
import IconSeta from "../../../assets/svg/IconsCardExplorar/angulo-direito1.svg";

// novos imports de ícones (adicione/ajuste conforme seus arquivos)
// import IconReact from "../../../assets/svg/IconsInterface/react-1.svg";
// import IconBancoDeDados from "../../../assets/svg/IconsInterface/base-de-dados-1.svg";
// import IconFront from "../../../assets/svg/IconsInterface/codigo-simples-1.svg";
// import IconGroup from "../../../assets/svg/IconsInterface/group.svg";
// import IconIllustrator from "../../../assets/svg/IconsInterface/illustrator-1.svg";

const { width, height } = Dimensions.get('window')

export default function CardsTrilhas({ item, professorName }) {
    const navigation = useNavigation();

    const trailName = item?.trailName ?? 'Sem nome'
    const vacancies = item?.vacancies ?? item?.vacanciesTrail ?? item?.vagas ?? 'N/A'

    // // mapa para converter strings em componentes SVG
    // const ICONS_MAP = {
    //     // chaves normalizadas (sem espaços/traços/pontos)
    //     react: IconReact,
    //     'react-1': IconReact,
    //     'base-de-dados': IconBancoDeDados,
    //     'basededados': IconBancoDeDados,
    //     banco: IconBancoDeDados,
    //     db: IconBancoDeDados,
    //     front: IconFront,
    //     'codigo-simples': IconFront,
    //     group: IconGroup,
    //     java: IconGroup,
    //     illustrator: IconIllustrator,
    //     'illustrator-1': IconIllustrator,
    //     users: IconPessoas,
    //     'users-alt-1': IconPessoas,
    // };

    // // resolve o componente de ícone a partir da prop Icons
    // let IconComponent = IconPessoas; // fallback
    // if (typeof Icons === 'string') {
    //     const normalized = Icons.toString().toLowerCase().replace(/[\s_\-\.]/g, '');
    //     // tenta encontrar pelo nome normalizado ou pelo valor original em lowercase
    //     IconComponent = ICONS_MAP[normalized] ?? ICONS_MAP[Icons.toLowerCase()] ?? IconPessoas;
    // } else if (Icons) {
    //     // se vier um componente React (função/classe), usa direto
    //     IconComponent = Icons;
    // }

    // Escolha de mídia: prioridade para ÍCONE; senão imagem; senão placeholder estilizado
    const renderTrailVisual = () => {
        const iconNameRaw = item?.trailIcon || item?.icon || null;

        console.log("=== DEBUG ICONE ===");
        console.log("Recebido do backend:", iconNameRaw);

        // ✅ Se backend não enviou o ícone → cai no fallback
        if (!iconNameRaw) {
            console.log("Nenhum ícone recebido, usando fallback visual.");
            return (
                <View style={[styles.FotoIconTrilha, { backgroundColor: '#5217b1ff' }]}>
                    <Text style={{ color: '#CE82FF', fontSize: 12 }}>Trilha</Text>
                </View>
            );
        }

        const key = iconNameRaw.toString().toLowerCase().replace(/[^a-z0-9]/g, '');

        const IconComponent = iconMap[key];
        console.log("Normalizado:", key, "| Existe no iconMap?", !!IconComponent);

        if (IconComponent) {
            return (
                <View style={styles.FotoIconTrilha}>
                    <IconComponent width={28} height={28} fill="#FFF" />
                </View>
            );
        }

        return (
            <View style={[styles.FotoIconTrilha, { backgroundColor: '#5217b1ff' }]}>
                <Text style={{ color: '#CE82FF', fontSize: 12 }}>Trilha</Text>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <View style={styles.BoxCard}>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                    <View style={styles.FotoTrilha}>
                        {renderTrailVisual()}
                    </View>

                    <Text style={styles.title}>{trailName}</Text>

                </View>

                {/* Informações do Professor */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 30, height: 30, borderRadius: 20, backgroundColor: '#CCC' }} />
                    <Text style={{ color: '#B3B3B3' }}>Prof: {professorName ?? 'Desconhecido'}</Text>
                </View>

                <View style={styles.Infomações}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <IconPessoas width={15} height={24} fill="#CE82FF" />
                        <Text style={{ color: '#CE82FF', fontSize: 13 }}> Vagas Disponiveis: {vacancies}</Text>
                    </View>


                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                        onPress={async () => {
                            await AsyncStorage.setItem("currentTrail", JSON.stringify(item));
                            navigation.navigate('Trilha', { trailId: item?.trailId, trailName: item?.trailName })
                        }}
                    >
                        <Text style={styles.TextTrilha} > Explorar  </Text>
                        <IconSeta width={15} height={24} fill="#CE82FF" />
                    </TouchableOpacity>

                </View>


            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(90, 24, 154, 0.4)',
        borderWidth: 2,
        borderColor: '#5A189A',
        width: width * 0.9,
        height: 'auto',
        borderRadius: 25,
        justifyContent: 'flex-end',
        paddingBottom: 16,
        paddingTop: 16,
        paddingLeft: 14,
        paddingRight: 14,
    },
    BoxCard: {
        width: '100%',
        height: 'auto',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 15,
    },
    FotoTrilha: {
        width: 50,
        height: 50,
        backgroundColor: '#CE82FF33',
        borderRadius: 15
    },
    Infomações: {
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12
    },
    FotoIconTrilha: {
        backgroundColor: '#cd82ff3f',
        height: 50,
        width: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    TextTrilha: {
        color: '#CE82FF'
    },
    title: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15

    }
})