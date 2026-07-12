import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './AstVisualizer.module.css';

const AstVisualizer = ({ nodes: initialNodes, edges: initialEdges }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  if (!nodes.length) {
      return (
          <div className={styles.emptyState}>
              No syntax tree generated. Try analyzing some JavaScript or TypeScript code first!
          </div>
      )
  }

  return (
    <div className={styles.visualizerContainer}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap nodeStrokeColor={(n) => {
          if (n.style?.background) return n.style.background;
          return '#0041d0';
        }} nodeColor={(n) => {
          return '#1f2937';
        }} />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default AstVisualizer;
