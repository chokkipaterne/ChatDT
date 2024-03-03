import { useEffect, useState } from 'react';
import Tree from 'react-d3-tree';
import { useSelector } from 'react-redux';
import { useCenteredTree } from './helpers';

const DecisionTree = (props) => {
  const tree_layout = useSelector((state) => state.tree_layout);
  const showType = props.showType;
  const treeData = props.treeData;
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const containerStyles =
    width > 768
      ? {
          width: '100vw',
          height: '90vh',
        }
      : {
          width: '100vw',
          height: '90vh',
        };

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

  const onNodeMouseOver = (evt) => {
    console.log('hello');
    console.log(evt);
  };

  const renderCircleSvgNode = ({ nodeDatum, toggleNode }) => (
    <g>
      <circle
        r='20'
        x='-10'
        fill={
          showType === 1
            ? nodeDatum.attributes?.color_gini
            : showType === 2
            ? nodeDatum.attributes?.color_var_red
            : nodeDatum.attributes?.color_num_samples
        }
        onClick={toggleNode}
      />
      <text fill='black' strokeWidth='1' x='30'>
        {nodeDatum.name}
      </text>
      {showType === 1 && nodeDatum.attributes?.gini && (
        <text fill='#777' x='30' dy='20' strokeWidth='0.1'>
          gini: {nodeDatum.attributes?.gini}
        </text>
      )}
      {showType === 2 && nodeDatum.attributes?.var_red && (
        <text fill='#777' x='30' dy='20' strokeWidth='0.1'>
          var: {nodeDatum.attributes?.var_red}
        </text>
      )}
      {showType === 3 && nodeDatum.attributes?.num_samples && (
        <text fill='#777' x='30' dy='20' strokeWidth='0.1'>
          #sp: {nodeDatum.attributes?.num_samples}
        </text>
      )}
      {nodeDatum.attributes?.leaf_type !== 2 && (
        <text fill='#777' x='30' dy='40' strokeWidth='0.1'>
          node: {nodeDatum.attributes?.node}
        </text>
      )}
    </g>
  );

  const removePropertiesRecursive = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      // Deep copy of the object to avoid modifying the original data
      obj = JSON.parse(JSON.stringify(obj));
      // Check if the properties exist before removing them
      if (obj.leaf_type === 2) {
        if (obj.hasOwnProperty('gini')) {
          delete obj.gini;
        }
        if (obj.hasOwnProperty('var_red')) {
          delete obj.var_red;
        }
        if (obj.hasOwnProperty('num_samples')) {
          delete obj.num_samples;
        }
        if (obj.hasOwnProperty('node')) {
          delete obj.node;
        }
      }
      if (obj.hasOwnProperty('color_num_samples')) {
        delete obj.color_num_samples;
      }
      if (obj.hasOwnProperty('leaf_type')) {
        delete obj.leaf_type;
      }
      if (obj.hasOwnProperty('color_var_red')) {
        delete obj.color_var_red;
      }
      if (obj.hasOwnProperty('color_gini')) {
        delete obj.color_gini;
      }
      // Recursively process child nodes
      for (let key in obj) {
        obj[key] = removePropertiesRecursive(obj[key]);
      }
    }
    return obj;
  };
  //const modifiedData = removePropertiesRecursive(treeData.output);
  const [dimensions, translate, containerRef] = useCenteredTree();
  const scaleExtent = { min: 0, max: 10 };
  const defaultTranslate = width > 768 ? { x: 350, y: 60 } : { x: 150, y: 60 };
  return (
    <div style={containerStyles} ref={containerRef}>
      {showType === 0 && (
        <Tree
          data={removePropertiesRecursive(treeData.output)}
          translate={defaultTranslate}
          orientation='vertical'
          rootNodeClassName='node__root'
          branchNodeClassName='node__branch'
          leafNodeClassName='node__leaf'
          scaleExtent={scaleExtent}
          zoomable={true}
        />
      )}
      {showType > 0 && (
        <Tree
          data={treeData.output}
          translate={defaultTranslate}
          orientation='vertical'
          renderCustomNodeElement={renderCircleSvgNode}
          scaleExtent={scaleExtent}
          zoomable={true}
        />
      )}
    </div>
  );
};

export default DecisionTree;
