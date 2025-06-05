# Implementação do React Family Tree

## Problema Identificado

Após análise do código, identifiquei que o projeto ainda não possui a implementação efetiva do componente `react-family-tree`. Existem apenas referências à biblioteca nos comentários e um componente placeholder `FamilyNode.tsx`, mas não há uma integração funcional que permita visualizar graficamente a árvore genealógica.

Atualmente, a página `/tree` apenas exibe os dados brutos em formato JSON, sem qualquer visualização gráfica.

## Solução Proposta

Vou detalhar os passos necessários para implementar corretamente o `react-family-tree` e visualizar a árvore genealógica:

### 1. Instalação das Dependências Necessárias

O `react-family-tree` requer algumas dependências adicionais para funcionar corretamente:

```bash
npm install react-family-tree relative-time-format @types/react-family-tree
```

### 2. Adaptação dos Dados para o Formato Esperado

O `react-family-tree` espera um formato específico de dados. Precisamos transformar os dados recebidos da API GraphQL para este formato:

```typescript
// Interfaces para o react-family-tree
interface FamilyNode {
  id: string;
  gender: 'male' | 'female';
  parents: string[];
  children: string[];
  siblings: string[];
  spouses: string[];
  // Campos personalizados para nossa aplicação
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
}

interface ExtNode extends FamilyNode {
  left: number;
  top: number;
  hasSubTree?: boolean;
}
```

### 3. Criação do Componente de Visualização da Árvore

Vamos criar um novo componente para renderizar a árvore genealógica:

```tsx
// src/components/tree/FamilyTreeVisualization.tsx
import React, { useState, useCallback } from 'react';
import FamilyTree from 'react-family-tree';
import FamilyNode from './FamilyNode';
import type { ExtNode } from 'react-family-tree';

// Constantes para o tamanho dos nós
const NODE_WIDTH = 100;
const NODE_HEIGHT = 100;

interface FamilyTreeVisualizationProps {
  familyData: any; // Dados recebidos da API
}

const FamilyTreeVisualization: React.FC<FamilyTreeVisualizationProps> = ({ familyData }) => {
  // Transformar os dados recebidos para o formato esperado pelo react-family-tree
  const [nodes, setNodes] = useState<any[]>(() => {
    // Implementar a lógica de transformação aqui
    // Este é um exemplo simplificado, a implementação real dependerá da estrutura dos dados recebidos
    return transformDataToFamilyTreeFormat(familyData);
  });

  // ID do nó raiz (geralmente o usuário atual)
  const rootId = nodes.length > 0 ? nodes[0].id : '';

  // Renderização do nó
  const renderNode = useCallback(({ node }: { node: ExtNode }) => {
    return (
      <FamilyNode
        key={node.id}
        node={{
          id: node.id,
          firstName: node.firstName,
          lastName: node.lastName,
          birthDate: node.birthDate,
        }}
        style={{
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          transform: `translate(${node.left * (NODE_WIDTH / 2)}px, ${node.top * (NODE_HEIGHT / 2)}px)`,
        }}
      />
    );
  }, []);

  if (!rootId) {
    return <p>Nenhum dado disponível para visualização.</p>;
  }

  return (
    <div className="family-tree-container" style={{ height: '600px', overflow: 'auto', position: 'relative' }}>
      <FamilyTree
        nodes={nodes}
        rootId={rootId}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        renderNode={renderNode}
        className="family-tree"
      />
    </div>
  );
};

// Função para transformar os dados da API no formato esperado pelo react-family-tree
function transformDataToFamilyTreeFormat(apiData: any): any[] {
  // Esta função precisa ser implementada com base na estrutura exata dos dados retornados pela API
  // Exemplo simplificado:
  if (!apiData || !apiData.nodes) return [];

  return apiData.nodes.map((user: any) => ({
    id: user.id,
    gender: user.gender || 'male', // Valor padrão se não estiver definido
    parents: [user.fatherId, user.motherId].filter(Boolean),
    children: user.children?.map((child: any) => child.id) || [],
    siblings: user.siblings?.map((sibling: any) => sibling.id) || [],
    spouses: user.spouses?.map((spouse: any) => spouse.id) || [],
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
    deathDate: user.deathDate,
  }));
}

export default FamilyTreeVisualization;
```

### 4. Atualização da Página da Árvore

Agora, vamos atualizar a página `/tree` para incluir o componente de visualização:

```tsx
// src/app/tree/page.tsx (modificado)
'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import FamilyTreeVisualization from '../../components/tree/FamilyTreeVisualization';

// Queries existentes...

export default function TreePage() {
    // Código existente...

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sua Árvore Genealógica</h1>

            {isLoading ? (
                <p className="text-center mt-10">Carregando árvore genealógica...</p>
            ) : error ? (
                <p className="text-center mt-10 text-red-600">Erro ao carregar árvore: {error.message}</p>
            ) : !userId ? (
                <p className="text-center mt-10">Usuário não identificado.</p>
            ) : !treeData?.getFamilyTreeData ? (
                <p className="text-center mt-10">Não foram encontrados dados da árvore para este usuário.</p>
            ) : (
                <>
                    {/* Visualização gráfica da árvore */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Visualização Gráfica</h2>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                            <FamilyTreeVisualization familyData={treeData.getFamilyTreeData} />
                        </div>
                    </div>

                    {/* Dados brutos (pode ser mantido para debug ou removido) */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Dados Brutos</h2>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow">
                            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                                {JSON.stringify(treeData.getFamilyTreeData, null, 2)}
                            </pre>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
```

### 5. Estilização Adicional

Para melhorar a aparência da árvore, podemos adicionar alguns estilos CSS:

```css
/* src/styles/familyTree.css */
.family-tree-container {
  width: 100%;
  overflow: auto;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.family-tree {
  position: relative;
}

/* Estilos para as linhas de conexão entre os nós */
.family-tree-connector {
  stroke: #6366f1;
  stroke-width: 2px;
}
```

## Considerações sobre a Estrutura de Dados

A implementação acima assume que os dados retornados pela API GraphQL através da query `getFamilyTreeData` contêm informações sobre os nós (usuários) e suas relações. A função `transformDataToFamilyTreeFormat` precisa ser adaptada com base na estrutura exata dos dados retornados.

Se a estrutura atual dos dados não for compatível com o formato esperado pelo `react-family-tree`, será necessário modificar o resolver GraphQL `getFamilyTreeData` no backend para retornar os dados no formato adequado.

## Próximos Passos

1. Instalar as dependências necessárias
2. Implementar o componente `FamilyTreeVisualization`
3. Adaptar a função de transformação de dados com base na estrutura real retornada pela API
4. Atualizar a página `/tree` para incluir o componente de visualização
5. Testar a renderização com diferentes conjuntos de dados
6. Ajustar estilos e layout conforme necessário
