import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ModalPublicandoTrilha({ visible, trail, onClose, onPublish }) {
  const REQUIRED_CODE = 'calygam up trail';
  const [code, setCode] = useState('');
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setValid(code.trim().toLowerCase() === REQUIRED_CODE);
  }, [code]);

  useEffect(() => {
    if (!visible) setCode('');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Publicando {trail?.trailName || 'Trilha'}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar">
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Digite o código abaixo para confirmar</Text>
          <Text style={styles.hintCode}>{REQUIRED_CODE}</Text>

          <Text style={[styles.label, { marginTop: 14 }]}>Código de confirmação</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="calygam up trail"
              placeholderTextColor="#9AA0A6"
              value={code}
              onChangeText={setCode}
              autoCapitalize='none'
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: valid ? '#6C63FF' : '#46405f' }]}
            onPress={() => valid && onPublish(code)}
            disabled={!valid}
          >
            <Text style={styles.primaryText}>Tornar pública</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#0f1219',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2F3A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    width: '85%',
  },
  close: {
    color: '#c9c9c9',
    fontSize: 18,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subtitle: {
    color: '#bfc3c9',
    marginTop: 8,
    paddingBottom: 8,
    paddingTop: 8,
  },
  label: {
    color: '#bfc3c9'
  },
  inputRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C4250',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 8,
    backgroundColor: '#141924',
  },
  input: {
    flex: 1,
    color: '#fff',
    height: 44,
  },
  primaryBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  hintCode: {
    backgroundColor: '#e6d5fb22',
    color: '#b58bf8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start'
  }
});