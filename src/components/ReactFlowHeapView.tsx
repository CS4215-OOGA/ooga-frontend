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

  let backgroundColor = '#f4f0e0';

  if (data.isSelected) {
    if (data.isParent) {
      backgroundColor = '#BEF0BA';
    } else if (data.isCurrent) {
      // light blue for current node
      backgroundColor = '#A7C7E7';
    } else {
      backgroundColor = '#FF7770';
    }
  }
  return (
    <div
      className={` p-2 rounded-md flex flex-col items-center justify-center text-black`}
      style={{
        background: backgroundColor,
        width: '200px'
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: data.hideLeftHandle ? 'hidden' : 'visible' }}
        isConnectable={isConnectable}
      />
      {labelLines.map((line, index) => (
        <div key={index}>{line}</div> // Render each line in a separate div
      ))}
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: data.hideRightHandle ? 'hidden' : 'visible' }}
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
        color: data.isCurrent ? 'yellow' : 'white',
        width: '200px'
      }}
    >
      {data.label}
    </div>
  );
}

function HeapView({ data }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    let localNodes = [];
    let localEdges = [];

    // Initialize nodes and edges for each element in the heap
    let x = 0;
    let y = 0;
    const xIncrement = 300;
    const yIncrement = 150;
    data.forEach(element => {
      // make it like a rectangle with 5 elements in a row
      x += xIncrement;
      if (x === xIncrement * 5) {
        x = 0;
        y += yIncrement;
      }

      const node = {
        id: element.address.toString(),
        type: 'custom',
        position: { x, y },
        data: {
          element: element,
          isSelected: false,
          label: `
            Address: ${element.address}
            Tag: ${element.tag}
            Size: ${element.size}
            Value: ${element.value}
            `,
          children: element.children,
          parents: element.parents
        }
      };
      localNodes.push(node);

      // Add edges between the parent and children
      element.children.forEach(child => {
        const edge = {
          id: `${element.address}-${child}`,
          source: element.address.toString(),
          target: child.toString(),
          animated: true
        };
        localEdges.push(edge);
      });
    });

    setNodes(localNodes);
    setEdges(localEdges);
  }, [data]);

  const onElementClick = (event, element) => {
    // Helper function to recursively toggle selection status
    const isSelected = !element.data.isSelected;

    const toggleChildren = element => {
      element.data.isSelected = isSelected;
      element.data.isParent = false;
      element.data.children.forEach(child => {
        const childElement = nodes.find(node => node.id === child.toString());
        if (childElement) {
          toggleChildren(childElement);
        }
      });
    };

    const toggleParents = element => {
      element.data.isSelected = isSelected;
      element.data.isParent = true;
      element.data.parents.forEach(parent => {
        const parentElement = nodes.find(node => node.id === parent.toString());
        if (parentElement) {
          toggleParents(parentElement);
        }
      });
    };

    // Reset selection status
    nodes.forEach(node => {
      node.data.isSelected = false;
      node.data.isParent = false;
      node.data.isCurrent = false;
    });

    toggleChildren(element);
    toggleParents(element);

    element.data.isParent = false;
    element.data.isCurrent = true;

    setNodes([...nodes]);
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

export default HeapView;
