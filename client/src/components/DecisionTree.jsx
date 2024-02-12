import { useEffect } from 'react';
import Tree from 'react-d3-tree';
import { useSelector } from 'react-redux';

const DecisionTree = (props) => {
  const tree_layout = useSelector((state) => state.tree_layout);
  useEffect(() => {
    // Create CSS dynamically based on state value
    const dynamicStyle = `
    .node__root > circle {
      fill: ${tree_layout.root_color};
      r: ${tree_layout.root_size};
    }
    .node__branch > circle {
      fill: ${tree_layout.branch_color};
      r: ${tree_layout.branch_size};
    }
    
    .node__leaf > circle {
      fill: ${tree_layout.leaf_color};
      r: ${tree_layout.leaf_size};
    }
  `;
    // Create a <style> element and set its content to the dynamic CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = dynamicStyle;

    // Append the <style> element to the document head
    document.head.appendChild(styleElement);

    // Cleanup function to remove the <style> element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [tree_layout]); // Run effect whenever 'color' state changes

  const renderRectSvgNode = ({ nodeDatum, toggleNode }) => (
    <g>
      <rect
        width='20'
        height='20'
        x='-10'
        fill={nodeDatum.attributes?.color_gini}
        onClick={toggleNode}
      />
      <text fill='black' strokeWidth='1' x='20'>
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes?.gini && (
        <text fill='black' x='20' dy='20' strokeWidth='1'>
          gini: {nodeDatum.attributes?.gini}
        </text>
      )}
    </g>
  );

  return (
    <Tree
      data={props.treeData}
      orientation='vertical'
      rootNodeClassName='node__root'
      branchNodeClassName='node__branch'
      leafNodeClassName='node__leaf'
    />
  );
};

export default DecisionTree;
