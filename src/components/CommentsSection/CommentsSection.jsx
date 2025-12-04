import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Modal } from 'react-native';
import { useComments } from '../../hooks/useComments';
import { CommentItem } from '../CommentItem/CommentItem';
import SkeletonComment from '../Skeletons/SkeletonComment';

/**
 * Componente principal para seção de comentários da atividade
 */
export const CommentsSection = ({ activityId }) => {
  const [commentText, setCommentText] = useState('');
  const [textInputHeight, setTextInputHeight] = useState(40);
  const [selectedItem, setSelectedItem] = useState(null); // {type: 'comment'|'reply', data: item}
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Item sendo editado
  const inputRef = useRef(null);

  const {
    comments,
    loading,
    hasNext,
    sending,
    refreshing,
    sendNewComment,
    updateComment,
    removeComment,
    loadMore,
    refresh
  } = useComments(activityId, 5000); // Auto-refresh a cada 5 segundos

  const handleSendComment = async () => {
    // Se estiver editando, atualiza o comentário
    if (editingItem) {
      const success = await updateComment(
        editingItem.data.messageActivityId, 
        commentText, 
        editingItem.type === 'reply'
      );
      if (success) {
        setCommentText('');
        setTextInputHeight(40);
        setEditingItem(null);
      }
      return;
    }

    // Senão, envia novo comentário
    const success = await sendNewComment(
      commentText,
      'MESSAGE_CONTRIBUTION',
      null
    );

    if (success) {
      setCommentText('');
      setTextInputHeight(40);
    }
  };

  // Função para enviar resposta (agora usada pelo CommentItem)
  const handleReply = async (replyToId, replyText) => {
    const success = await sendNewComment(
      replyText,
      'MESSAGE_REPLY',
      replyToId
    );
    return success;
  };

  // Abre o modal com opções
  const openMenu = useCallback((type, item) => {
    setSelectedItem({ type, data: item });
    setModalVisible(true);
  }, []);

  // Handler para editar - vai pro input
  const handleEditPress = useCallback(() => {
    if (!selectedItem) return;
    
    setModalVisible(false);
    setEditingItem(selectedItem);
    setCommentText(selectedItem.data.messageActivityDescription);
    
    // Foca no input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [selectedItem]);

  // Handler para deletar - mostra modal de confirmação
  const handleDeletePress = useCallback(() => {
    setModalVisible(false);
    
    // Marca como delete e reabre modal
    setTimeout(() => {
      if (selectedItem) {
        setSelectedItem({ ...selectedItem, type: 'delete' });
        setModalVisible(true);
      }
    }, 200);
  }, [selectedItem]);

  // Confirma a exclusão
  const confirmDelete = useCallback(async () => {
    if (!selectedItem) return;
    
    setModalVisible(false);
    await removeComment(selectedItem.data.messageActivityId);
    setSelectedItem(null);
  }, [selectedItem, removeComment]);

  // Cancela a exclusão
  const cancelDelete = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  // Backdrop do modal
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const renderComment = ({ item }) => (
    <CommentItem
      comment={item}
      onReply={handleReply}
      onMenuPress={openMenu}
      activityId={activityId}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#6C63FF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && comments.length === 0) {
      return <SkeletonComment count={5} />;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum comentário ainda.</Text>
        <Text style={styles.emptySubtext}>Seja o primeiro a comentar!</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Input de comentário */}
      <View style={styles.inputContainer}>
        {editingItem && (
          <View style={styles.editingBanner}>
            <Text style={styles.editingText}>
              Editando {editingItem.type === 'comment' ? 'comentário' : 'resposta'}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setEditingItem(null);
                setCommentText('');
              }}
            >
              <Text style={styles.cancelEditText}>✕ Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={[styles.inputBox, { minHeight: Math.max(60, textInputHeight + 20) }]}>
          <TextInput
            ref={inputRef}
            multiline
            value={commentText}
            onChangeText={setCommentText}
            onContentSizeChange={(e) => {
              setTextInputHeight(e.nativeEvent.contentSize.height);
            }}
            placeholder="Escreva seu comentário aqui..."
            placeholderTextColor="#B7B7B7"
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]} 
          onPress={handleSendComment}
          disabled={sending || !commentText.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.sendBtnText}>{editingItem ? 'Salvar' : 'Enviar'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Lista de comentários */}
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>Comentários da Turma</Text>
        <TouchableOpacity onPress={refresh} disabled={refreshing}>
          <Text style={styles.refreshText}>{refreshing ? '⟳' : '↻'}</Text>
        </TouchableOpacity>
      </View>

      {loading && comments.length === 0 ? (
        <SkeletonComment count={5} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.messageActivityId.toString()}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#6C63FF"
              colors={["#6C63FF"]}
            />
          }
          contentContainerStyle={comments.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {hasNext && !loading && (
        <TouchableOpacity onPress={loadMore} style={styles.loadMoreBtn}>
          <Text style={styles.loadMoreText}>Carregar mais comentários</Text>
        </TouchableOpacity>
      )}

      {/* Modal Simples de Confirmação */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={cancelDelete}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>
              {selectedItem?.type === 'delete' ? 'Deseja Deletar?' : 'Opções'}
            </Text>
            
            {selectedItem?.type !== 'delete' ? (
              <>
                <TouchableOpacity onPress={handleEditPress} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>✏️ Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleDeletePress} style={styles.modalButton}>
                  <Text style={[styles.modalButtonText, styles.deleteButtonText]}>🗑️ Deletar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.confirmButtons}>
                <TouchableOpacity 
                  onPress={cancelDelete} 
                  style={[styles.confirmButton, styles.cancelButton]}
                >
                  <Text style={styles.confirmButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={confirmDelete} 
                  style={[styles.confirmButton, styles.deleteConfirmButton]}
                >
                  <Text style={[styles.confirmButtonText, styles.deleteConfirmText]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputBox: {
    backgroundColor: '#1E3D35',
    width: '100%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 40,
  },
  sendBtn: {
    backgroundColor: '#592ced',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-end',
    minWidth: 80,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  commentsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#928cffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#B7B7B7',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#7C7C7C',
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreBtn: {
    backgroundColor: '#592ced56',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loadMoreText: {
    color: '#928cffff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Banner de edição
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  editingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelEditText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Modal simples
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    minWidth: 280,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 14,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteButtonText: {
    color: '#FF6B6B',
  },
  // Botões de confirmação
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#3C4250',
  },
  deleteConfirmButton: {
      backgroundColor: '#6C63FF',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteConfirmText: {
    color: '#FFF',
  },
});
