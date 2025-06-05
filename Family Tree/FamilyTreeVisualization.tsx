import React, { useState, useCallback } from 'react';
import FamilyTree from 'react-family-tree';
import FamilyNode from './FamilyNode';
import type { ExtNode } from 'react-family-tree';

// Constantes para o tamanho dos nós
const NODE_WIDTH = 100;
const NODE_HEIGHT = 100;

// Interfaces para o react-family-tree
interface FamilyNodeType {
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

interface FamilyTreeVisualizationProps {
  familyData: any; // Dados recebidos da API
}

const FamilyTreeVisualization: React.FC<FamilyTreeVisualizationProps> = ({ familyData }) => {
  // Transformar os dados recebidos para o formato esperado pelo react-family-tree
  const [nodes, setNodes] = useState<FamilyNodeType[]>(() => {
    // Implementar a lógica de transformação aqui
    return transformDataToFamilyTreeFormat(familyData);
  });

  // ID do nó raiz (geralmente o usuário atual)
  const rootId = nodes.length > 0 ? nodes[0].id : '';

  // Renderização do nó
  const renderNode = useCallback(({ node }: { node: ExtNode }) => {
    const familyNode = nodes.find(n => n.id === node.id);
    return (
      <FamilyNode
        key={node.id}
        node={{
          id: node.id,
          firstName: familyNode?.firstName,
          lastName: familyNode?.lastName,
          birthDate: familyNode?.birthDate,
        }}
        style={{
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          transform: `translate(${node.left * (NODE_WIDTH / 2)}px, ${node.top * (NODE_HEIGHT / 2)}px)`,
          position: 'absolute',
        }}
      />
    );
  }, [nodes]);

  if (!rootId) {
    return <p>Nenhum dado disponível para visualização.</p>;
  }

  return (
    <div className="family-tree-container" style={{ height: '600px', overflow: 'auto', position: 'relative', padding: '20px' }}>
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
function transformDataToFamilyTreeFormat(apiData: any): FamilyNodeType[] {
  // Esta função precisa ser implementada com base na estrutura exata dos dados retornados pela API
  console.log("Dados recebidos da API:", apiData);
  
  // Se não houver dados ou se a estrutura não for a esperada, retorna array vazio
  if (!apiData || (!apiData.nodes && !Array.isArray(apiData))) {
    console.warn("Dados inválidos recebidos para transformação");
    return [];
  }

  // Determinar se os dados estão no formato de array ou objeto com propriedade nodes
  const nodesArray = Array.isArray(apiData) ? apiData : apiData.nodes || [];
  
  // Mapear os dados para o formato esperado pelo react-family-tree
  return nodesArray.map((user: any) => ({
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
