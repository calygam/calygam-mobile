import React from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import FormTrilha from '../FormTrilha/FormTrilha'
import ModalAtividades from '../ModalAtividades/ModalAtividades'

export default function ModalCriarTrilha(props) {
    const {
        styles,
        bottomSheetRef,
        snapPoints,
        isEditing,
        nome,
        setNome,
        senha,
        setSenha,
        image,
        pickImage,
        IconImage,
        IconUpload,
        vagas,
        setVagas,
        descricao,
        setDescricao,
        handleOpenActivityModal,
        handleCloseModal,
        activitySheetRef,
        handleSaveActivities,
        activities,
    } = props

    return (
        <>
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={-1}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: '#0D141C' }}
            >
                <FormTrilha
                    styles={styles}
                    isEditing={isEditing}
                    nome={nome}
                    setNome={setNome}
                    senha={senha}
                    setSenha={setSenha}
                    image={image}
                    pickImage={pickImage}
                    IconImage={IconImage}
                    IconUpload={IconUpload}
                    vagas={vagas}
                    setVagas={setVagas}
                    descricao={descricao}
                    setDescricao={setDescricao}
                    onSubmit={handleOpenActivityModal}
                    onCancel={handleCloseModal}
                />
            </BottomSheet>

            <ModalAtividades
                activitySheetRef={activitySheetRef}
                handleSaveActivities={handleSaveActivities}
                isEditing={isEditing}
                activities={activities}
            />
        </>
    )
}
