import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

export default function ModalConfirmacaoCompra({ visible, onClose, item, onConfirmar, loading }) {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>Confirmar Compra</Text>
          <Text style={styles.mensagem}>
            Deseja comprar <Text style={styles.nomeDestaque}>{item.nome}</Text>?
          </Text>
          <Text style={styles.preco}>Preço: {item.preco} moedas</Text>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.btnCancelar} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btnConfirmar, loading && styles.btnDisabled]} 
              onPress={onConfirmar}
              disabled={loading}
            >
              <Text style={styles.btnConfirmarText}>
                {loading ? 'Comprando...' : 'Comprar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#021713',
    borderRadius: 20,
    padding: 25,
    width: '95%',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffffff',
    marginBottom: 15,
  },
  mensagem: {
    fontSize: 16,
    color: '#ffffffa7',
    textAlign: 'center',
    marginBottom: 10,
  },
  nomeDestaque: {
    fontWeight: '700',
    color: '#6C63FF',
  },
  preco: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancelar: {
    flex: 1,
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
    justifyContent: 'center',
  },
  btnCancelarText: {
    color: '#6C63FF',
    fontWeight: '600',
    fontSize: 15,
  },
  btnConfirmar: {
    flex: 1,
    backgroundColor: '#6C63FF',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  btnConfirmarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
