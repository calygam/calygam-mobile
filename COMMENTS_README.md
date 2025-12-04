# 💬 Sistema de Comentários - Instruções de Configuração

## 📦 Pacote Necessário

O sistema de comentários usa o `@gorhom/bottom-sheet` para os menus de opções. Se ainda não estiver instalado, execute:

```bash
npm install @gorhom/bottom-sheet@^4
```

ou

```bash
yarn add @gorhom/bottom-sheet@^4
```

**Nota:** O `GestureHandlerRootView` e `BottomSheetModalProvider` já estão configurados no `App.js` do projeto.

## ✨ Novas Funcionalidades Implementadas

### 1. **Input de Resposta Inline**
- Ao clicar em "Responder", um input aparece logo abaixo do comentário
- O teclado não cobre o input (ScrollView com KeyboardAvoidingView se necessário)
- Botões "Cancelar" e "Enviar" integrados no input
- Avatar do usuário ao lado do input

### 2. **Menu de 3 Pontinhos (⋮)**
- Aparece apenas para comentários do próprio usuário
- Abre um bottom sheet com opções:
  - **Editar**: Usa `Alert.prompt` nativo para edição
  - **Deletar**: Confirmação antes de excluir

### 3. **UX Melhorada**
- Resposta inline sem precisar usar input principal
- Menu bottom sheet estilo YouTube/Instagram
- Animações suaves de abertura/fechamento
- Focus automático no input de resposta

## 🎨 Fluxo de Uso

### Responder um Comentário:
1. Usuário clica em "Responder" no comentário
2. Input aparece inline abaixo do comentário
3. Usuário digita e clica "Enviar"
4. Resposta é enviada e lista de respostas se expande automaticamente

### Editar/Deletar:
1. Usuário clica nos 3 pontinhos (⋮) no seu comentário
2. Bottom sheet abre com opções
3. **Editar**: Alert prompt abre para edição
4. **Deletar**: Confirmação aparece antes de excluir

## 🔧 Componentes Atualizados

- ✅ `CommentItem.jsx` - Refatorado com reply inline e menu bottom sheet
- ✅ `CommentsSection.jsx` - Removida barra de "respondendo para" do input principal
- ✅ Estilos atualizados para novo layout

## 📱 Compatibilidade

- ✅ Android
- ✅ iOS (Alert.prompt pode ter comportamento diferente - considerar modal customizado se necessário)
- ✅ Keyboard avoid automático via refs e ScrollView

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar reações aos comentários (like, etc)
- [ ] Mencionar usuários com @
- [ ] Notificações de novas respostas
- [ ] Upload de imagens em comentários
- [ ] Modo escuro customizado para bottom sheet
