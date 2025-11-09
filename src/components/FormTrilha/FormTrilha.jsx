import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';

export default function FormTrilha({
    styles,
    isEditing,
    nome, setNome,
    senha, setSenha,
    image, pickImage,
    IconImage, IconUpload,
    vagas, setVagas,
    descricao, setDescricao,
    onSubmit,
    onCancel,
}) {
    return (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar Trilha' : 'Criar Nova Trilha'}</Text>

            <Text style={styles.label}>Nome da Trilha</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Figma "
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
            />
            <Text style={styles.label}>Senha da Trilha</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite a senha da trilha"
                placeholderTextColor="#888"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={false}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <View style={{ width: 50, height: 50, backgroundColor: '#F5F5F5', borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10, flexDirection: 'row' }}>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: 50, height: 50, borderRadius: 30 }} />
                    ) : (
                        IconImage ? <IconImage width={30} height={50} /> : null
                    )}
                </View>

                <TouchableOpacity onPress={pickImage} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5, borderColor: '#FFF', borderWidth: 2, padding: 10, borderRadius: 18 }}>
                    {IconUpload ? <IconUpload width={30} height={30} /> : null}
                    <Text style={{ color: '#FFF', fontSize: 14 }}>Adicionar Imagem</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Número de Vagas</Text>
            <TextInput
                style={styles.input}
                placeholder="Número de Vagas"
                placeholderTextColor="#888"
                value={vagas}
                onChangeText={setVagas}
                keyboardType="numeric"
            />
            <Text style={styles.label}>Descrição</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Essa trilha é focada em..."
                placeholderTextColor="#888"
                value={descricao}
                onChangeText={setDescricao}
            />
            <TouchableOpacity style={styles.confirmButton} onPress={onSubmit}>
                <Text style={styles.confirmText}>{isEditing ? 'Editar Atividades' : 'Continuar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}