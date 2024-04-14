import { useState, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component
function CustomNode({ data, isConnectable }) {
  // Split the label into lines
  const labelLines = data.label
    .trim()
    .split('\n')
    .map(line => line.trim());

  const backgroundColor = data.isSelected ? '#FF7770' : data.isCurrent ? '#FDFD96' : '#f4f0e0';

  return (
    <div
      className={` p-2 rounded-md flex flex-col items-center justify-center text-black`}
      style={{
        background: backgroundColor,
        width: '250px'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: data.hideTopHandle ? 'hidden' : 'visible' }}
        isConnectable={isConnectable}
      />
      {labelLines.map((line, index) => (
        <div key={index}>{line}</div> // Render each line in a separate div
      ))}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: data.hideBottomHandle ? 'hidden' : 'visible' }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

function TitleNode({ data }) {
  return (
    <div
      className={`p-2 rounded-md flex items-center justify-center underline text-xl`}
      style={{
        color: data.isCurrent ? '#FDFD96' : '#f4f0e0',
        width: '200px'
      }}
    >
      {data.label + (data.isCurrent ? ' (Current)' : '')}
    </div>
  );
}
// Create nodes and edges with title nodes for each thread
function createNodesAndEdges(data, startX, threadIndex, isCurrent) {
  const nodes = [];
  const edges = [];
  const types = ['OS', 'RTS'];
  let yOffset = 0;

  // Thread title node
  nodes.push({
    id: `title-${threadIndex}`,
    type: 'title',
    data: {
      label: `Thread ${threadIndex}`,
      isCurrent,
      isTitle: true,
      hideTopHandle: true,
      hideBottomHandle: true
    },
    position: { x: startX, y: yOffset }
  });

  yOffset += 100;

  types.forEach((type, idx) => {
    // Section title nodes
    nodes.push({
      id: `${threadIndex}-${type}-title`,
      type: 'title',
      data: { label: type, isCurrent, isTitle: true, hideTopHandle: true, hideBottomHandle: true },
      position: { x: startX + idx * 300 - 150, y: yOffset }
    });

    data[type.toLowerCase()].forEach((item, i) => {
      const id = `${threadIndex}-${type}-${i}`;
      nodes.push({
        id,
        data: {
          label: `
          Addr: ${item.address}
          Value: ${item.value}
          Raw: ${item.raw}
          `,
          isCurrent,
          hideTopHandle: i === 0,
          hideBottomHandle: i === data[type.toLowerCase()].length - 1
        },
        position: { x: startX + idx * 300 - 150, y: yOffset + 120 * (i + 1) },
        type: 'custom'
      });
      if (i > 0) {
        edges.push({
          id: `e${threadIndex}-${type}-${i - 1}-${i}`,
          source: `${threadIndex}-${type}-${i - 1}`,
          target: id,
          animated: true
        });
      }
    });
  });
  return { nodes, edges };
}

function StackView({ data, currentThreadIndex }) {
  console.log(data);
  console.log(currentThreadIndex);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    let localNodes = [];
    let localEdges = [];

    // Initialize nodes and edges for each thread
    data.forEach((threadData, index) => {
      const { nodes: threadNodes, edges: threadEdges } = createNodesAndEdges(
        threadData,
        index * 600,
        index,
        index === currentThreadIndex
      );
      localNodes = [...localNodes, ...threadNodes];
      localEdges = [...localEdges, ...threadEdges];
    });

    setNodes(localNodes);
    setEdges(localEdges);
  }, [data, currentThreadIndex]);

  const onElementClick = (event, element) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === element.id) {
        return {
          ...node,
          data: {
            ...node.data,
            isSelected: !node.data.isSelected // Toggle the isSelected property
          }
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const nodeTypes = {
    custom: CustomNode,
    title: TitleNode
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onElementClick}
      fitView
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}

export default StackView;
