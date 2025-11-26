import React from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { StepBottomSheetContent } from '../ModalAtividadeProf/ModalAtividade';

export default function ModalAtividades({ activitySheetRef, handleSaveActivities, isEditing, activities }) {
    return (
        <BottomSheet
            ref={activitySheetRef}
            snapPoints={['60%', '95%']}
            index={-1}
            enablePanDownToClose={true}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            backgroundStyle={{ backgroundColor: '#0D141C' }}
            handleIndicatorStyle={{ backgroundColor: '#ffffffff' }}
        >
            <StepBottomSheetContent onSave={handleSaveActivities} isEditing={isEditing} initialActivities={activities} />
        </BottomSheet>
    );
}