# Serviço de Professores - Documentação

## 📋 Visão Geral

Sistema para buscar e exibir informações de professores (nome + foto) nos cards de trilhas, sem necessidade de alterar o backend.

## 🗂️ Arquivos Criados

### 1. `src/services/teacherService.js`
**Responsabilidade**: Comunicação com backend e gerenciamento de cache

**Principais funções**:
- `fetchTeachers(forceRefresh)` - Busca todos os professores do backend
- `getTeacherById(userId)` - Busca um professor específico
- `enrichTrailsWithTeachers(trails)` - Enriquece trilhas com dados de professores
- `clearTeachersCache()` - Limpa cache (útil para forçar atualização)

**Cache**:
- Armazena professores em memória por 5 minutos
- Evita chamadas repetidas ao backend
- Pode ser forçado a atualizar com `forceRefresh=true`

### 2. `src/hooks/useTeacherData.js`
**Responsabilidade**: Hook React para usar o teacherService

**Recursos**:
- Carrega professores automaticamente na montagem
- Gerencia estados de loading e erro
- Facilita uso em componentes React

**Uso**:
\`\`\`javascript
const { teachers, loading, getTeacher, enrichTrails, refresh } = useTeacherData();

// Buscar professor específico
const prof = getTeacher(userId);

// Enriquecer trilhas
const enrichedTrails = await enrichTrails(trails);

// Forçar atualização
await refresh();
\`\`\`

## 🔄 Fluxo de Dados

### Backend → Frontend

1. **Backend envia**:
   - `TrailDTO.user` - ID do professor (userId)
   - Endpoint `/users/readAllUsers/teacher` retorna lista de professores

2. **teacherService busca**:
   \`\`\`
   GET /users/readAllUsers/teacher?page=0&size=500&sort=userId,desc
   \`\`\`

3. **Backend retorna** (`DataUtilUserDTO`):
   \`\`\`json
   {
     "userId": 123,
     "userName": "João Silva",
     "userImage": "http://10.0.0.191:8080/file/read/user/abc-123.jpg",
     "userEmail": "joao@email.com",
     "userRole": "TEACHER"
   }
   \`\`\`

4. **teacherService cria Map**:
   \`\`\`javascript
   Map {
     123 => { userId: 123, userName: "João Silva", userImage: "..." }
   }
   \`\`\`

5. **enrichTrailsWithTeachers mescla**:
   \`\`\`javascript
   // Trail original
   { trailId: 1, trailName: "Java", user: 123 }
   
   // Trail enriquecida
   {
     trailId: 1,
     trailName: "Java",
     user: 123,
     professorName: "João Silva",
     professorImage: "http://10.0.0.191:8080/file/read/user/abc-123.jpg",
     professor: { ... }
   }
   \`\`\`

## 🎯 Integração em BibliotecaCursos

### Antes:
\`\`\`javascript
const trails = await api.get('trail/read/all-trails');
setTrails(trails);
\`\`\`

### Depois:
\`\`\`javascript
const trails = await api.get('trail/read/all-trails');
const enrichedTrails = await enrichTrailsWithTeachers(trails);
setTrails(enrichedTrails);
\`\`\`

### CardsTrilhas recebe:
\`\`\`jsx
<CardsTrilhas
  item={item}
  professorName={item.professorName}  // ← Já enriquecido
  professorPhotoUrl={item.professorImage}  // ← URL completa
/>
\`\`\`

## 🛡️ Tratamento de Erros

### Fallbacks implementados:

1. **Professor não encontrado**:
   - `professorName` = "Professor não encontrado"
   - `professorImage` = null (usa avatar padrão)

2. **Erro ao buscar professores**:
   - Retorna Map vazio
   - Trilhas são retornadas sem enriquecimento
   - Não quebra a UI

3. **Imagem inválida**:
   - `onError` handler no Image mostra avatar padrão
   - Log para debug

## 📊 Logs de Debug

### teacherService:
- `[TeacherService] 📦 Usando cache de professores`
- `[TeacherService] 🔄 Buscando professores do backend...`
- `[TeacherService] ✅ X professores carregados`
- `[TeacherService] 🔧 Enriquecendo X trilhas...`

### BibliotecaCursos:
- `[BibliotecaCursos] 👨‍🏫 Trilhas enriquecidas com professores`
- Lista com `{ professor: "Nome" }` para cada trilha

### CardsTrilhas:
- `[CardsTrilhas] Erro ao carregar foto do professor: URL`

## ⚡ Performance

### Cache em Memória:
- **Duração**: 5 minutos
- **Benefício**: Evita múltiplas chamadas ao backend
- **Quando limpar**: Após ações que alteram professores

### Paginação:
- Busca `size=500` professores por vez
- Suficiente para maioria dos casos
- Se tiver mais professores, aumentar `size` ou implementar paginação

## 🔧 Manutenção

### Para adicionar novos campos de professor:

1. Atualizar `teacherService.js`:
\`\`\`javascript
teacherMap.set(teacher.userId, {
  userId: teacher.userId,
  userName: teacher.userName,
  userImage: teacher.userImage,
  // ← Adicionar novo campo aqui
  userBio: teacher.userBio,
});
\`\`\`

2. Usar em `CardsTrilhas`:
\`\`\`jsx
<Text>{item.professorBio}</Text>
\`\`\`

### Para forçar atualização do cache:

\`\`\`javascript
import { clearTeachersCache } from '../services/teacherService';

// Após ação que altera professor
clearTeachersCache();
\`\`\`

## 🧪 Testes Sugeridos

1. **Trilha com professor válido**: Deve mostrar nome e foto
2. **Trilha sem professor (user=null)**: Deve mostrar "Professor não encontrado"
3. **Professor sem foto**: Deve mostrar avatar padrão
4. **Erro de rede**: Deve continuar funcionando sem enriquecimento
5. **Cache**: Segunda navegação deve ser instantânea

## 📝 Notas Importantes

1. **URL da imagem**: Backend já retorna URL completa (`/file/read/user/{archiveName}`)
2. **Campo `user`**: TrailDTO usa `user` (não `userId` ou `teacherId`)
3. **Paginação**: Endpoint suporta `page`, `size`, `sort`
4. **Authorization**: Endpoint `/users/readAllUsers/teacher` pode não exigir token (confirmar)

## 🚀 Próximos Passos (Opcional)

1. **Persistir cache** em AsyncStorage para sobreviver a fechamento do app
2. **Lazy loading** de fotos para melhorar performance
3. **Endpoint específico** no backend: `GET /users/{id}` para buscar professor individual
4. **Backend incluir professor** direto no TrailDTO (ideal, requer mudança no back)
