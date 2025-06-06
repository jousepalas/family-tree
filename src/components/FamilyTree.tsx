// src/components/FamilyTree.tsx
'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
// Import the component and necessary types from the library
import ReactFamilyTree, { Node, Gender, RelType } from 'react-family-tree';
import { Loader2 } from 'lucide-react'; // Removed unused zoom/pan icons
import { Card, CardContent } from '@/components/ui/card';
// Removed unused Button, CardHeader imports
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDate } from '@/lib/utils';

// Define the possible string values coming FROM GRAPHQL
type GraphQLGenderString = "MALE" | "FEMALE" | "NON_BINARY" | "OTHER" | "PREFER_NOT_SAY";

// GraphQL Query - Ensure gender and necessary relationship IDs are fetched
const GET_FAMILY_TREE_DATA_FOR_REACT_FAMILY_TREE = gql`
 query GetFamilyTreeData($userId: ID!) {
  # This resolver needs to return nodes with unique 'nodeId',
  # 'parents' (list of parent nodeIds), and 'children' (list of child nodeIds)
  getFamilyTreeData(userId: $userId) {
    nodes {
      id # Original DB ID (User or ManualMember)
      nodeId # Unique ID for the tree (e.g., user-123, manual-456) - USED AS 'id' FOR THE LIBRARY
      type # 'USER' or 'MANUAL'
      name
      gender # Expecting GraphQLGenderString
      dateOfBirth
      imageUrl
      parents # List of parent nodeIds (MUST be nodeId format)
      spouses # List of spouse nodeIds (MUST be nodeId format)
      children # List of child nodeIds (MUST be nodeId format) - REQUIRED by react-family-tree
    }
  }
}
`;

// Define the node structure expected by react-family-tree
// Use the imported 'Gender' type from the library
// Extend the library's base Node type for better compatibility
interface ReactFamilyTreeNode extends Node {
    id: string; // MUST be unique - maps to GraphQL 'nodeId'
    gender: Gender; // Use the imported Gender type ('male' | 'female' | 'unknown')
    parents: Relation[]; // Use Relation type from library { id: string; type: RelType }
    children: Relation[]; // Use Relation type from library { id: string; type: RelType }
    siblings?: Relation[]; // Optional
    spouses?: Relation[]; // Optional
    placeholder?: boolean; // Flag for default nodes
    // Custom data for rendering goes in 'extra'
    extra?: {
        name: string;
        originalGender?: GraphQLGenderString | null; // Store original value
        dob?: string | null;
        imageUrl?: string | null;
        isUser: boolean; // True if originally a User, false if Manual or Placeholder
        originalId: string; // Original DB ID or placeholder ID
        isPlaceholder?: boolean; // Explicit flag for placeholders
    };
    // Properties added by react-family-tree layout algorithm:
    left?: number;
    top?: number;
}

// Define Relation type structure based on library's expected type
interface Relation {
    id: string;
    type: RelType; // 'blood' | 'married' | 'divorced' | 'adopted'
}

interface FamilyTreeProps {
    startUserId: string; // The DB ID of the user whose tree we are viewing
}

const NODE_WIDTH = 160; // Increased width slightly
const NODE_HEIGHT = 75; // Increased height slightly

// --- Custom Node Renderer for react-family-tree ---
const FamilyNode: React.FC<{ node: ReactFamilyTreeNode; style: React.CSSProperties }> = React.memo(({ node, style }) => {
    const { name, originalGender, dob, imageUrl, isUser, originalId, isPlaceholder } = node.extra || {
        name: 'Unknown', originalGender: null, dob: null, imageUrl: null, isUser: false, originalId: node.id, isPlaceholder: false,
    };

    const getInitials = (nameStr?: string | null) => {
        if (!nameStr) return '?';
        const names = nameStr.split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    let borderColor = 'border-muted';
    let bgColor = 'bg-card';
    if (isPlaceholder) {
        borderColor = 'border-dashed border-gray-400 dark:border-gray-600'; // Dashed border for placeholders
        bgColor = 'bg-muted/50'; // Slightly different background
    } else if (isUser) {
        borderColor = originalGender === 'MALE' ? 'border-blue-400'
                    : originalGender === 'FEMALE' ? 'border-pink-400'
                    : 'border-primary';
    } else { // Manual entry
        borderColor = 'border-gray-500';
    }

    const handleClick = useCallback(() => {
        const type = isPlaceholder ? 'Placeholder' : isUser ? 'User' : 'Manual';
         alert(`Clicked on ${name} (ID: ${originalId}, Type: ${type})`);
         // TODO: Implement actual action, e.g., open modal to add details for placeholders
    }, [name, originalId, isUser, isPlaceholder]);

    return (
        <div
            style={style}
            className={`absolute flex items-center p-1.5 rounded border ${borderColor} ${bgColor} shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
            onClick={handleClick}
        >
            <Avatar className="h-10 w-10 mr-2 flex-shrink-0">
                {/* Show placeholder icon if it's a placeholder and no image */}
                {isPlaceholder && !imageUrl ? (
                     <AvatarFallback className="bg-transparent text-muted-foreground">?</AvatarFallback>
                ) : (
                    <>
                        <AvatarImage src={imageUrl ?? undefined} alt={name ?? "Member"} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </>
                )}
            </Avatar>
            <div className="flex flex-col justify-center overflow-hidden text-xs">
                <p className={`font-semibold truncate ${isPlaceholder ? 'text-muted-foreground italic' : 'text-foreground'}`}>{name || 'Unknown'}</p>
                {dob && !isPlaceholder && <p className="text-muted-foreground truncate">{dob}</p>}
                {!isUser && !isPlaceholder && <p className="text-muted-foreground italic text-[10px]"> (Manual)</p>}
                 {isPlaceholder && <p className="text-muted-foreground text-[10px]">Click to add</p>}
            </div>
        </div>
    );
});
FamilyNode.displayName = 'FamilyNode';


const FamilyTree: React.FC<FamilyTreeProps> = ({ startUserId }) => {
    // We use the *database* ID to fetch data, but the *nodeId* (e.g., user-...) for the tree root
    const initialRootNodeId = `user-${startUserId}`;
    const [rootId, setRootId] = useState<string>(initialRootNodeId);

    const { data, loading, error } = useQuery(GET_FAMILY_TREE_DATA_FOR_REACT_FAMILY_TREE, {
        variables: { userId: startUserId }, // Fetch based on DB ID
        fetchPolicy: 'cache-and-network',
    });

    // --- Transform GraphQL data AND add placeholders ---
    const nodes = useMemo((): ReactFamilyTreeNode[] => {
        const sourceNodes = data?.getFamilyTreeData?.nodes;
        if (!sourceNodes) return []; // Return empty if no data yet

        type GraphQLNode = {
            id: string; // DB ID
            nodeId: string; // Tree ID
            type: 'USER' | 'MANUAL';
            name: string;
            gender: GraphQLGenderString | null;
            dateOfBirth: string | null;
            imageUrl: string | null;
            parents: string[] | null | undefined;
            spouses: string[] | null | undefined;
            children: string[] | null | undefined;
        };

        const mapGender = (gender: GraphQLGenderString | null): Gender => {
            if (gender === 'MALE') return 'male';
            if (gender === 'FEMALE') return 'female';
            return 'unknown';
        };

        // Initial mapping from GraphQL to the library's structure
        let mappedNodes: ReactFamilyTreeNode[] = sourceNodes.map((node: GraphQLNode): ReactFamilyTreeNode => ({
            id: node.nodeId, // Use nodeId for the tree's internal ID
            gender: mapGender(node.gender),
            // Ensure relationships are always arrays of Relation objects
            parents: (node.parents ?? []).map(id => ({ id, type: 'blood' as RelType })),
            children: (node.children ?? []).map(id => ({ id, type: 'blood' as RelType })),
            spouses: (node.spouses ?? []).map(id => ({ id, type: 'married' as RelType })),
            siblings: [], // Initialize siblings if needed later
            extra: {
                name: node.name,
                originalGender: node.gender,
                dob: node.dateOfBirth ? formatDate(node.dateOfBirth) : null,
                imageUrl: node.imageUrl,
                isUser: node.type === 'USER',
                originalId: node.id, // Keep original DB ID
                isPlaceholder: false,
            },
        }));

        // --- Add Placeholders if Root User Has No Parents ---
        const rootUserNode = mappedNodes.find(node => node.id === initialRootNodeId);

        if (rootUserNode && rootUserNode.parents.length === 0) {
            console.log(`Root user ${rootUserNode.id} has no parents. Adding placeholders.`);

            const fatherPlaceholderId = `placeholder-father-${startUserId}`;
            const motherPlaceholderId = `placeholder-mother-${startUserId}`;

            // Create placeholder nodes
            const fatherPlaceholder: ReactFamilyTreeNode = {
                id: fatherPlaceholderId,
                gender: 'male',
                parents: [],
                children: [{ id: rootUserNode.id, type: 'blood' }], // Link to root user
                spouses: [{ id: motherPlaceholderId, type: 'married'}], // Link placeholders as spouses
                siblings: [],
                placeholder: true, // Flag for the library if it uses it
                extra: {
                    name: "Father",
                    isUser: false,
                    originalId: fatherPlaceholderId, // Use placeholder ID
                    isPlaceholder: true,
                }
            };

            const motherPlaceholder: ReactFamilyTreeNode = {
                id: motherPlaceholderId,
                gender: 'female',
                parents: [],
                children: [{ id: rootUserNode.id, type: 'blood' }], // Link to root user
                spouses: [{ id: fatherPlaceholderId, type: 'married'}], // Link placeholders as spouses
                siblings: [],
                placeholder: true,
                extra: {
                    name: "Mother",
                    isUser: false,
                    originalId: motherPlaceholderId,
                    isPlaceholder: true,
                }
            };

            // Add placeholders to the nodes list
            mappedNodes.push(fatherPlaceholder, motherPlaceholder);

            // Update the root user's parents list
            rootUserNode.parents = [
                { id: fatherPlaceholderId, type: 'blood' },
                { id: motherPlaceholderId, type: 'blood' }
            ];
        }

        return mappedNodes;

    }, [data, startUserId, initialRootNodeId]); // Add dependencies


    // --- Loading and Error States ---
    if (loading && nodes.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="ml-3 text-lg">Loading Family Tree...</span>
            </div>
        );
    }

    if (error) {
        console.error("Error loading family tree data:", error);
        return <p className="text-red-500 text-center py-10">Error loading family tree: {error.message}</p>;
    }

    // If still no nodes after loading/error checks (e.g., backend returned empty array even for root user)
    if (nodes.length === 0) {
         console.log("No nodes available to render the tree, even after potential placeholder logic.");
         return <p className="text-muted-foreground text-center py-10">Could not load user data to display the tree.</p>;
    }

    // --- Root Node Check (ensure the node we intend to start with exists) ---
    const rootNodeExists = nodes.some(node => node.id === rootId);
    let currentRootId = rootId;

    if (!rootNodeExists) {
        console.warn(`Intended root node ID "${rootId}" not found. Using initial user ID "${initialRootNodeId}" as root.`);
        currentRootId = initialRootNodeId; // Try resetting to the logged-in user's node ID
        // Double check if even the initial user ID exists after mapping/placeholders
        if (!nodes.some(node => node.id === currentRootId)) {
             console.error("Fatal: Initial root user node not found in final nodes array.");
             return <p className="text-red-500 text-center py-10">Error: Cannot find starting point for the tree.</p>;
        }
    }

    // --- Render the Tree ---
    return (
        <Card className="w-full h-[70vh] md:h-[80vh] overflow-auto relative p-4 border"> {/* Added border for visibility */}
            <CardContent className="p-0 h-full w-full relative min-w-max min-h-max"> {/* Allow content to expand */}
                {/* Add a key to force re-render if nodes array changes significantly */}
                <ReactFamilyTree
                    key={nodes.length} // Simple key based on node count
                    nodes={nodes}
                    rootId={currentRootId} // Use the verified or fallback root ID
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    renderNode={(node: ReactFamilyTreeNode) => (
                        <FamilyNode
                            key={node.id}
                            node={node}
                            style={{
                                position: 'absolute',
                                left: `${node.left ?? 0}px`,
                                top: `${node.top ?? 0}px`,
                                width: NODE_WIDTH,
                                height: NODE_HEIGHT,
                                // Add transition for smoother updates (optional)
                                transition: 'left 0.3s ease, top 0.3s ease',
                            }}
                        />
                    )}
                    // Add some basic styling to the SVG container if needed
                    className="relative" // Make SVG container relative for absolute nodes
                />
            </CardContent>
        </Card>
    );
};

export default FamilyTree; // Export the main component