import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { useReplies } from '../../hooks/useComments';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Componente para exibir um único comentário com opções de responder, editar e deletar
 */
export const CommentItem = ({ 
  comment, 
  onReply, 
  onMenuPress,
  activityId 
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const replyInputRef = useRef(null);

  // Verifica se o usuário é o dono do comentário
  useEffect(() => {
    const checkOwner = async () => {
      try {
        // DEBUG: Ver todo o objeto comment
        console.log('[CommentItem] COMMENT COMPLETO:', JSON.stringify(comment, null, 2));
        
        // Caso contrário, compara userId
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('[CommentItem] Sem token, não é owner');
          setIsOwner(false);
          return;
        }

        // Decodifica o token para obter userId
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const currentUserId = decoded?.userId || decoded?.sub;

        console.log('[CommentItem] Token decodificado:', decoded);
        console.log('[CommentItem] currentUserId do token:', currentUserId);

        // Compara com o userId do comentário
        const commentUserId = comment.userId || comment.user?.userId;
        console.log('[CommentItem] commentUserId:', commentUserId);
        console.log('[CommentItem] comment.messageUserOwner (do backend):', comment.messageUserOwner);
        
        // Usar SEMPRE a verificação manual, ignorando messageUserOwner do backend
        const owner = Number(currentUserId) === Number(commentUserId);
        setIsOwner(owner);
        console.log('[CommentItem] ✅ RESULTADO FINAL - isOwner:', owner);
      } catch (error) {
        console.error('[CommentItem] ❌ Erro ao verificar proprietário:', error);
        setIsOwner(false);
      }
    };

    checkOwner();
  }, [comment]);

  const { replies, loading: loadingReplies, hasNext, loadMore, refresh } = useReplies(
    showReplies ? comment.messageActivityId : null,
    activityId
  );

  useEffect(() => {
    if (showReplyInput && replyInputRef.current) {
      setTimeout(() => {
        replyInputRef.current?.focus();
      }, 100);
    }
  }, [showReplyInput]);

  const handleReplyPress = () => {
    setShowReplyInput(true);
    // Garantir que o modal não abra quando clicar em responder
    // O modal só deve abrir quando clicar nos 3 pontos
    // Não chama onMenuPress aqui
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSendingReply(true);
    const success = await onReply(comment.messageActivityId, replyText);
    if (success) {
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
      refresh();
      Keyboard.dismiss();
    }
    setSendingReply(false);
  };

  const handleCancelReply = () => {
    setReplyText('');
    setShowReplyInput(false);
    Keyboard.dismiss();
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeaderRow}>
        <View style={styles.commentHeader}>
          <Image
            source={{ 
              uri: comment.userImageUrl || 'https://via.placeholder.com/50'
            }}
            style={styles.userAvatar}
          />
          <View style={styles.commentContent}>
            <Text style={styles.userName}>{comment.userName}</Text>
            <Text style={styles.commentText}>{comment.messageActivityDescription}</Text>

            <View style={styles.commentActions}>
              <TouchableOpacity onPress={handleReplyPress}>
                <Text style={styles.actionText}>Responder</Text>
              </TouchableOpacity>

              {comment.messageResSize > 0 && (
                <TouchableOpacity onPress={toggleReplies}>
                  <Text style={styles.actionText}>
                    {showReplies ? 'Ocultar' : `Ver ${comment.messageResSize}`} {comment.messageResSize === 1 ? 'resposta' : 'respostas'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity 
            onPress={(e) => {
              // Prevenir propagação de eventos
              e.stopPropagation();
              // Só abre o modal quando clicar explicitamente nos 3 pontos
              onMenuPress('comment', comment);
            }} 
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Input de resposta inline */}
      {showReplyInput && (
        <View style={styles.replyInputContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.replyInputAvatar}
          />
          <View style={styles.replyInputBox}>
            <TextInput
              ref={replyInputRef}
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Escreva sua resposta..."
              placeholderTextColor="#B7B7B7"
              multiline
            />
            <View style={styles.replyInputActions}>
              <TouchableOpacity onPress={handleCancelReply}>
                <Text style={styles.cancelReplyText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSendReply} 
                disabled={!replyText.trim() || sendingReply}
                style={[styles.sendReplyBtn, (!replyText.trim() || sendingReply) && styles.sendReplyBtnDisabled]}
              >
                {sendingReply ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.sendReplyText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
                  onMenuPress={onMenuPress}
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
const ReplyItem = ({ reply, onMenuPress }) => {
  const [isOwner, setIsOwner] = useState(false);

  // Verifica se o usuário é o dono da resposta
  useEffect(() => {
    const checkOwner = async () => {
      try {
        console.log('[ReplyItem] REPLY COMPLETA:', JSON.stringify(reply, null, 2));
        
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('[ReplyItem] ❌ Token não encontrado');
          setIsOwner(false);
          return;
        }

        // Decodifica o token para obter userId
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        console.log('[ReplyItem] Token decodificado:', JSON.stringify(decoded, null, 2));
        
        const currentUserId = decoded?.userId || decoded?.sub;
        const replyUserId = reply.userId || reply.user?.userId;
        
        console.log('[ReplyItem] messageUserOwner do backend:', reply.messageUserOwner);
        console.log('[ReplyItem] Verificação manual - currentUserId:', currentUserId, 'vs replyUserId:', replyUserId);
        
        // SEMPRE usa verificação manual, ignorando backend
        const owner = Number(currentUserId) === Number(replyUserId);
        setIsOwner(owner);
        console.log('[ReplyItem] ✅ RESULTADO FINAL - isOwner:', owner);
      } catch (error) {
        console.error('[ReplyItem] ❌ Erro ao verificar proprietário:', error);
        setIsOwner(false);
      }
    };

    checkOwner();
  }, [reply]);

  return (
    <View style={styles.replyContainerWrapper}>
      <View style={styles.replyContainer}>
        <Image
          source={{ 
            uri: reply.userImageUrl || 'https://via.placeholder.com/40'
          }}
          style={styles.replyAvatar}
        />
        <View style={styles.replyContent}>
          <Text style={styles.replyUserName}>{reply.userName}</Text>
          <Text style={styles.replyText}>{reply.messageActivityDescription}</Text>
        </View>
      </View>
      {isOwner && (
        <TouchableOpacity 
          onPress={(e) => {
            // Prevenir propagação de eventos
            e.stopPropagation();
            // Só abre o modal quando clicar explicitamente nos 3 pontos
            onMenuPress('reply', reply);
          }} 
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginBottom: 20,
    width: '100%',
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
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
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  menuButton: {
    padding: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  menuDots: {
    color: '#B7B7B7',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'center',
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
  replyContainerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
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
    marginBottom: 4,
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
  replyInputContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginLeft: 62,
    marginBottom: 8,
  },
  replyInputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#6C63FF',
  },
  replyInputBox: {
    flex: 1,
    backgroundColor: '#1E3D35',
    borderRadius: 12,
    padding: 12,
  },
  replyInput: {
    color: '#FFFFFF',
    fontSize: 13,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  replyInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    alignItems: 'center',
  },
  cancelReplyText: {
    color: '#B7B7B7',
    fontSize: 12,
    fontWeight: '600',
  },
  sendReplyBtn: {
    backgroundColor: '#6C63FF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  sendReplyBtnDisabled: {
    opacity: 0.5,
  },
  sendReplyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
