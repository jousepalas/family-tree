import React from 'react';

// Define a simple interface for the node data expected
// Adjust this based on the actual data structure your `getFamilyTreeData` returns in the `nodes` array
interface NodeData {
  id: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string | Date;
  // Add other relevant fields as needed by your visualization
}

interface FamilyNodeProps {
  node: NodeData; // The data for this specific node
  style?: React.CSSProperties; // Style object passed by visualization libraries
  // Add other props passed by the specific visualization library you choose
}

const FamilyNode: React.FC<FamilyNodeProps> = ({ node, style }) => {
  // *** IMPORTANT ***
  // This is a VERY basic placeholder component.
  // Real visualization libraries (like react-family-tree, d3, visx)
  // will require specific structures, props, and potentially SVG rendering.
  // You will need to adapt or replace this component when implementing
  // the actual tree visualization.

  return (
    <div
      style={style} // Apply styles passed by the layout engine
      className="bg-white dark:bg-gray-700 border border-indigo-300 dark:border-indigo-600 rounded-md shadow-lg p-2 text-center text-xs cursor-pointer hover:shadow-xl transition-shadow"
    >
      <p className="font-semibold text-gray-800 dark:text-gray-100">
        {node.firstName || 'Nome'} {node.lastName || 'Sobrenome'}
      </p>
      <p className="text-gray-600 dark:text-gray-400">ID: {node.id.substring(0, 6)}...</p>
       {/* Add more details like birthDate if available and desired */}
       {/* {node.birthDate && <p className="text-gray-500">{new Date(node.birthDate).toLocaleDateString()}</p>} */}
    </div>
  );
};

export default FamilyNode;