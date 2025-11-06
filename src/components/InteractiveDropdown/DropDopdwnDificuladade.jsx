import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export default function CustomDropdown({ value: propValue, onChange }) {
  const [internalValue, setInternalValue] = useState(null);
  
  // Se receber value via props, usa ele; senão usa o estado interno
  const value = propValue !== undefined ? propValue : internalValue;

  const data = [
    { label: 'Fácil', value: 'easy' },
    { label: 'Médio', value: 'medium' },
    { label: 'Difícil', value: 'hard' },
    { label: 'Chefe', value: 'boss' },
  ];

  const handleChange = (item) => {
    const selectedValue = item.value;
    console.log('Item selecionado:', item);
    if (onChange) {
      onChange(selectedValue);
    } else {
      setInternalValue(selectedValue);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dificuldade</Text>
      <Dropdown
        style={styles.dropdown}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Selecione a dificuldade"
        value={value}
        onChange={handleChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 8, color: '#ffffffff' },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
});
