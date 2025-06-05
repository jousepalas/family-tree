# Documentação da Implementação do React Family Tree

## Resumo da Implementação

Implementei com sucesso a integração do componente `react-family-tree` no projeto. A implementação inclui:

1. Instalação das dependências necessárias:
   - react-family-tree
   - relative-time-format

2. Criação do componente `FamilyTreeVisualization.tsx` que:
   - Transforma os dados da API para o formato esperado pelo react-family-tree
   - Renderiza a árvore genealógica com nós personalizados
   - Permite visualização gráfica das relações familiares

3. Atualização da página principal `/tree` para:
   - Incluir o componente de visualização gráfica
   - Manter a visualização dos dados brutos para fins de debug
   - Melhorar a experiência do utilizador com uma interface mais intuitiva

## Estrutura da Solução

### Componente FamilyTreeVisualization

Este componente é responsável por:
- Receber os dados da API GraphQL
- Transformá-los para o formato esperado pelo react-family-tree
- Renderizar a árvore genealógica com nós personalizados

A transformação dos dados é feita pela função `transformDataToFamilyTreeFormat`, que adapta os dados recebidos para o formato:

```typescript
interface FamilyNodeType {
  id: string;
  gender: 'male' | 'female';
  parents: string[];
  children: string[];
  siblings: string[];
  spouses: string[];
  // Campos personalizados
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
}
```

### Integração na Página Principal

A página `/tree` foi atualizada para incluir:
- Uma seção para a visualização gráfica da árvore
- A manutenção da visualização dos dados brutos para fins de debug
- Melhor tratamento de estados de carregamento e erro

## Possíveis Melhorias Futuras

1. **Estilização Avançada**: Adicionar estilos CSS mais elaborados para melhorar a aparência da árvore.

2. **Interatividade**: Implementar funcionalidades como zoom, pan e clique nos nós para ver mais detalhes.

3. **Personalização dos Nós**: Melhorar o componente `FamilyNode` para exibir mais informações e ter um design mais atraente.

4. **Otimização para Árvores Grandes**: Implementar carregamento sob demanda ou virtualização para lidar com árvores genealógicas muito grandes.

5. **Exportação**: Adicionar funcionalidade para exportar a árvore como imagem ou PDF.

## Instruções para Testes

Para testar a implementação:

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a página da árvore genealógica no navegador.

3. Verifique se a visualização gráfica está a funcionar corretamente:
   - Os nós devem ser exibidos com os nomes dos utilizadores
   - As conexões entre os nós devem representar as relações familiares
   - A árvore deve ser navegável e responsiva

4. Se encontrar problemas, verifique o console do navegador para possíveis erros e ajuste a função de transformação de dados conforme necessário.

## Notas Importantes

- A função de transformação de dados (`transformDataToFamilyTreeFormat`) pode precisar de ajustes dependendo da estrutura exata dos dados retornados pela API GraphQL.
- O componente está configurado para lidar com diferentes formatos de dados (array ou objeto com propriedade nodes).
- Logs de debug foram adicionados para facilitar a identificação de problemas durante o desenvolvimento.
