import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import React from 'react';
import IconAviso from '../../../assets/svg/IconsStatusModais/IconAviso.svg';

const ModalEntrega = ({ visible, onClose, onConfirm, loading }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <View style={{ marginBottom: 10, backgroundColor: '#FEF0C7', borderRadius: 50, padding: 10, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}><IconAviso /></View>
                        <Text style={styles.modalTitle}>Deseja Entregar?</Text>
                    </View>
           
                    <Text style={styles.modalSubtitle}>Após a confirmação você não poderá cancelar o envio dessa atividade novamente.</Text>
                    <View style={{ gap: 10, marginTop: 12 }}>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#6C63FF' }]} onPress={onConfirm} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnText}>Confirmar</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#3A3F4A' }]} onPress={onClose} disabled={loading}>
                            <Text style={styles.modalBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
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
    modalSubtitle: {
        color: '#bfc3c9',
        fontSize: 13,
    },
    modalBtn: {
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: { color: '#fff', fontWeight: '700' },
};

export default ModalEntrega;
