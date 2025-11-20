import React from 'react';
import { Modal, View, FlatList, TouchableOpacity } from 'react-native';

import IconFigma from '../../../assets/svg/IconsModalTrail/figma 3.svg';
import IconReact from '../../../assets/svg/IconsModalTrail/reactNative.svg';
import IconBanco from '../../../assets/svg/IconsModalTrail/banco.svg';
import IconIllustrador from '../../../assets/svg/IconsModalTrail/illustrator.svg';
import IconIOT from '../../../assets/svg/IconsModalTrail/site-alt.svg';
import IconCodigo from '../../../assets/svg/IconsModalTrail/site-alt.svg';

const iconNames = [
    { name: "Figma", key: "figma", component: IconFigma },
    { name: "React Native", key: "react", component: IconReact },
    { name: "Banco de Dados", key: "banco", component: IconBanco },
    { name: "Illustrator", key: "illustrator", component: IconIllustrador },
    { name: "IoT", key: "iot", component: IconIOT },
    { name: "Código", key: "codigo", component: IconCodigo },
]
// Mapa de ícones com aliases comuns para tolerar variações vindas do backend
const iconMap = {
    // Figma
    figma: IconFigma,
    // React / React Native
    react: IconReact,

    // Banco de Dados / Database
    banco: IconBanco,

    // Illustrator
    illustrator: IconIllustrador,

    // IoT / Site Alt
    iot: IconIOT,

    // Código / Frontend
    codigo: IconCodigo,

};

const IconSelector = ({ visible, onSelectIcon, onClose }) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ backgroundColor: '#0D141C', padding: 20, borderRadius: 10, width: '80%', maxHeight: '60%' }}>
                    <FlatList
                        data={iconNames}
                        numColumns={3}
                        renderItem={({ item }) => {
                            const IconComponent = item.component;
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        onSelectIcon(item.key);
                                        onClose();
                                    }}
                                    style={{ margin: 10, alignItems: 'center' }}
                                >
                                    <IconComponent width={25} height={25} />
                                </TouchableOpacity>
                            );
                        }}
                        keyExtractor={(item) => item.key}
                    />
                </View>
            </View>
        </Modal>
    );
};

export { iconMap };
export default IconSelector;