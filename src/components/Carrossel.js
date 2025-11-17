// Crie um novo arquivo, por ex: src/components/Carrossel.js

import React from 'react';
import { View, FlatList, useWindowDimensions, StyleSheet } from 'react-native';

const CARD_WIDTH_PERCENTAGE = 0.80;

const ITEM_SPACING = 25;

const LIST_PADDING = 15;


export default function Carrossel({ data, renderItem, keyExtractor }) {

    // useWindowDimensions é mais moderno que o Dimensions
    const { width } = useWindowDimensions();


    const cardWidth = width * CARD_WIDTH_PERCENTAGE;

    const snapInterval = cardWidth + ITEM_SPACING;

    /**
     * Esta é a função que a FlatList vai USAR.
     * Ela "envolve" o seu componente (o CardProcessoTrilha)
     * em uma View com a largura e margens corretas.
     */
    const renderWrapper = ({ item, index }) => {
        // Chama a função renderItem que VOCÊ passou
        const renderedChild = renderItem({ item, index });

        // Envolve o seu card no "wrapper" com o estilo certo
        return (
            <View style={{
                width: cardWidth, // 85% da tela
                marginRight: ITEM_SPACING, // 10px de espaço à direita
                

                // O padding inicial é aplicado APENAS no primeiro item
                marginLeft: index === 0 ? LIST_PADDING : 0,
            }}>
    
                {renderedChild}
            </View>
        );
    };

    return (
        <FlatList
            horizontal
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderWrapper}

            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={snapInterval}
            disableIntervalMomentum

            // Estilo do container que "segura" todos os itens
            contentContainerStyle={{
                paddingRight: LIST_PADDING, 
                alignItems: 'center', 
            }}
        />
    );
}