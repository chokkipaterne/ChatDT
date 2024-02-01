import Tree from 'react-d3-tree';
import './custom-tree.css';

const DecisionTree = (props) => {
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
