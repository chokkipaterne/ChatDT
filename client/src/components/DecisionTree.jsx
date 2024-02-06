import { useEffect, useState } from 'react';
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
