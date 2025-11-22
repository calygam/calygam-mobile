import { View, Text, TouchableOpacity, Modal } from 'react-native';
import React from 'react';
import IconSucesso from '../../../assets/svg/IconsStatusModais/IconSucesso.svg';

const ModalSucessoEntrega = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <View style={{ marginBottom: 10, backgroundColor: '#D1FADF', borderRadius: 50, padding: 10, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}><IconSucesso /></View>
                        <Text style={styles.modalTitle}>Atividade entregue!</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: '#6C63FF', marginTop: 12 }]}
                        onPress={onConfirm}
                    >
                        <Text style={styles.modalBtnText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = {
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#0f1219',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#2A2F3A',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    modalBtn: {
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: { color: '#fff', fontWeight: '700' },
};

export default ModalSucessoEntrega;
