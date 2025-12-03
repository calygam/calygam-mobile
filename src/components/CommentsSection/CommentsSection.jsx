import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useComments } from '../../hooks/useComments';
import { CommentItem } from '../CommentItem/CommentItem';

/**
 * Componente principal para seção de comentários da atividade
 */
export const CommentsSection = ({ activityId }) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(40);

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
    const success = await sendNewComment(
      commentText,
      'MESSAGE_CONTRIBUTION',
      replyingTo?.messageActivityId
    );

    if (success) {
      setCommentText('');
      setReplyingTo(null);
      setTextInputHeight(40);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    // Focar no input (opcional: usar ref)
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const renderComment = ({ item }) => (
    <CommentItem
      comment={item}
      onReply={handleReply}
      onEdit={updateComment}
      onDelete={removeComment}
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
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color="#6C63FF" size="large" />
        </View>
      );
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
        {replyingTo && (
          <View style={styles.replyingToBar}>
            <Text style={styles.replyingToText}>
              Respondendo para <Text style={styles.replyingToName}>{replyingTo.userName}</Text>
            </Text>
            <TouchableOpacity onPress={handleCancelReply}>
              <Text style={styles.cancelReplyText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputBox, { minHeight: Math.max(60, textInputHeight + 20) }]}>
          <TextInput
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
            <Text style={styles.sendBtnText}>Enviar</Text>
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

      {hasNext && !loading && (
        <TouchableOpacity onPress={loadMore} style={styles.loadMoreBtn}>
          <Text style={styles.loadMoreText}>Carregar mais comentários</Text>
        </TouchableOpacity>
      )}
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
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6C63FF33',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    color: '#B7B7B7',
    fontSize: 12,
  },
  replyingToName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelReplyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
});
