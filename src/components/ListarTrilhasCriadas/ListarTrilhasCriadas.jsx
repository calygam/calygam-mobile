import React from 'react';
import { FlatList, Image } from 'react-native';
import CardProf from '../CardProfTrilhas/CardProf';

// professorPhoto: URL da foto do professor (perfil) que deve aparecer no círculo.
// Se não houver foto do professor, usa placeholder local.
export default function ListarTrilhasCriadas({ createdTrails, onEdit, onPublish, professorPhoto }) {
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
                    // Exibe sempre a foto do professor, não a imagem da trilha
                    foto={
                        <Image
                            source={professorPhoto ? { uri: professorPhoto } : require('../../../assets/image/SemPerfil.jpeg')}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                        />
                    }
                    onEdit={onEdit}
                    onPublish={onPublish}
                    item={item}
                />
            )}
            keyExtractor={(item, index) => String(item.trailId || item.id || index)}
            showsVerticalScrollIndicator={true}
        />
    );
}