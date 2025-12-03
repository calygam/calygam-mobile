import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useReplies } from '../../hooks/useComments';

/**
 * Componente para exibir um único comentário com opções de responder, editar e deletar
 */
export const CommentItem = ({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  activityId 
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.messageActivityDescription);

  const { replies, loading: loadingReplies, hasNext, loadMore, refresh } = useReplies(
    showReplies ? comment.messageActivityId : null,
    activityId
  );

  const handleEdit = async () => {
    const success = await onEdit(comment.messageActivityId, editText, false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar este comentário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Deletar', 
          style: 'destructive',
          onPress: () => onDelete(comment.messageActivityId)
        }
      ]
    );
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Image
          source={{ 
            uri: comment.userImageUrl || 'https://via.placeholder.com/50'
          }}
          style={styles.userAvatar}
        />
        <View style={styles.commentContent}>
          <Text style={styles.userName}>{comment.userName}</Text>
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEdit} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.commentText}>{comment.messageActivityDescription}</Text>
          )}

          <View style={styles.commentActions}>
            {/* Botão de responder */}
            <TouchableOpacity onPress={() => onReply(comment)}>
              <Text style={styles.actionText}>Responder</Text>
            </TouchableOpacity>

            {/* Mostrar respostas se houver */}
            {comment.messageResSize > 0 && (
              <TouchableOpacity onPress={toggleReplies}>
                <Text style={styles.actionText}>
                  {showReplies ? 'Ocultar' : `Ver ${comment.messageResSize}`} {comment.messageResSize === 1 ? 'resposta' : 'respostas'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Editar e deletar apenas se for do usuário */}
            {comment.messageUserOwner && (
              <>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete}>
                  <Text style={[styles.actionText, styles.deleteText]}>Deletar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Área de respostas */}
      {showReplies && (
        <View style={styles.repliesContainer}>
          {loadingReplies && replies.length === 0 ? (
            <ActivityIndicator color="#6C63FF" />
          ) : (
            <>
              {replies.map(reply => (
                <ReplyItem 
                  key={reply.messageActivityId} 
                  reply={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {hasNext && (
                <TouchableOpacity onPress={loadMore} style={styles.loadMoreBtn}>
                  <Text style={styles.loadMoreText}>Carregar mais respostas</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Componente para exibir uma resposta (reply)
 */
const ReplyItem = ({ reply, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.messageActivityDescription);

  const handleEdit = async () => {
    const success = await onEdit(reply.messageActivityId, editText, true);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar esta resposta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Deletar', 
          style: 'destructive',
          onPress: () => onDelete(reply.messageActivityId)
        }
      ]
    );
  };

  return (
    <View style={styles.replyContainer}>
      <Image
        source={{ 
          uri: reply.userImageUrl || 'https://via.placeholder.com/40'
        }}
        style={styles.replyAvatar}
      />
      <View style={styles.replyContent}>
        <Text style={styles.replyUserName}>{reply.userName}</Text>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.saveBtn}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.replyText}>{reply.messageActivityDescription}</Text>
        )}

        {reply.messageUserOwner && !isEditing && (
          <View style={styles.replyActions}>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={[styles.actionText, styles.deleteText]}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginBottom: 20,
    width: '100%',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#6C63FF',
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  commentText: {
    color: '#E0E0E0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  actionText: {
    color: '#928cffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: {
    color: '#FF6B6B',
  },
  repliesContainer: {
    marginLeft: 62,
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#3C4250',
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#6C63FF',
  },
  replyContent: {
    flex: 1,
  },
  replyUserName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 3,
  },
  replyText: {
    color: '#E0E0E0',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  loadMoreBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  loadMoreText: {
    color: '#928cffff',
    fontSize: 12,
    fontWeight: '600',
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#1E3D35',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#B7B7B7',
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 6,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
