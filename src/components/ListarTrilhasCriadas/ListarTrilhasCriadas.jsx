import React from 'react';
import { FlatList, Image } from 'react-native';
import CardProf from '../CardProfTrilhas/CardProf';

export default function ListarTrilhasCriadas({ createdTrails, onEdit }) {
    return (
        <FlatList
            data={createdTrails}
            style={{ flex: 1, width: '95%' }}
            contentContainerStyle={{ paddingBottom: 160 }}
            renderItem={({ item }) => (
                <CardProf
                    titulo={item.trailName}
                    descricao={item.trailDescription}
                    professorNome={"Você"}
                    vagas={item.trailVacancy}
                    foto={<Image source={{ uri: item.trailImage }} style={{ width: 40, height: 40, borderRadius: 20 }} />}
                    onEdit={onEdit}
                    item={item}
                />
            )}
            keyExtractor={(item, index) => String(item.trailId || item.id || index)}
            showsVerticalScrollIndicator={true}
        />
    );
}