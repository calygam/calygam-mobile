import React from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
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
        status,
        setStatus,
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
            <BottomSheetModal
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: '#0D141C' }}
                style={{ zIndex: 100 }}
                handleIndicatorStyle={{ backgroundColor: '#ffffffff' }}
            >
                <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 60 }}>
                    <FormTrilha
                        styles={styles}
                        isEditing={isEditing}
                        nome={nome}
                        setNome={setNome}
                        senha={senha}
                        setSenha={setSenha}
                        status={status}
                        setStatus={setStatus}
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
                </BottomSheetScrollView>
            </BottomSheetModal>

            <ModalAtividades
                activitySheetRef={activitySheetRef}
                handleSaveActivities={handleSaveActivities}
                isEditing={isEditing}
                activities={activities}
            />
        </>
    )
}
