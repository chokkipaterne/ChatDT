import Instructions from 'components/Instructions';
import TableComponent from 'components/TableComponent';
import DecisionTree from 'components/DecisionTree';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  addMessage,
  setInstructions,
  updateInstructions,
  updateTreeLayout,
  setHasTree,
  setResponseFilename,
} from 'state';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const divRef = useRef(null);

  const scrollToBottom = (scrollDelay = 300) => {
    const delayedScroll = setTimeout(() => {
      if (divRef.current) {
        //divRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        divRef.current.scrollTop = divRef.current.scrollHeight;
      }
    }, scrollDelay);
    return () => clearTimeout(delayedScroll);
  };

  const dtfile = useSelector((state) => state.dtfile);
  const messages = useSelector((state) => state.messages);
  const instructions = useSelector((state) => state.instructions);
  const columns = useSelector((state) => state.columns);
  const response_filename = useSelector((state) => state.response_filename);
  const has_tree = useSelector((state) => state.has_tree);

  useEffect(() => {
    if (dtfile === null) {
      navigate('/');
    }
  }, [dtfile, navigate]);

  //const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sidebar, setSidebar] = useState(false);
  const [contentSidebar, setContentSidebar] = useState(0);
  const [showType, setShowType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState({});
  const [hasCreationdt, setHasCreationdt] = useState(false);

  useEffect(() => {
    show(2);
    scrollToBottom();
  }, []);

  const instructionsArray = [
    'set features to',
    'set target to',
    'set max depth to',
    'set min samples split to',
    'generate',
    'set training data size to',
    'with a threshold of',
    'one of the following features',
    'any feature except the following',
    'remove tree from node',
    'set root node color to',
    'set root node size to',
    'set branch node color to',
    'set branch node size to',
    'set leaf node color to',
    'set leaf node size to',
  ];

  const getNumber = (str) => {
    const regex = /[+-]?\d+(\.\d+)?/g;
    if (str.match(regex)) {
      const floats = str.match(regex).map(function (v) {
        return parseFloat(v);
      });
      return floats[0];
    }
    return null;
  };

  const getColumns = (str) => {
    const myArray = str.split(',');
    let listCols = [];
    for (let i = 0; i < myArray.length; i++) {
      for (let j = 0; j < columns.length; j++) {
        if (
          myArray[i].trim() !== '' &&
          myArray[i].trim().toLowerCase() === columns[j].toLowerCase()
        ) {
          listCols = [...listCols, columns[j]];
          break;
        }
      }
    }
    //console.log(listCols);
    return listCols;
  };

  const generateTree = async () => {
    const formData = new FormData();
    formData.append('constraints', JSON.stringify(instructions));
    formData.append('filename', dtfile);
    if (
      'nodes_constraints' in instructions &&
      Object.keys(instructions.nodes_constraints).length !== 0
    ) {
      formData.append('rep_filename', response_filename);
    } else {
      formData.append('rep_filename', 'no');
    }

    try {
      const endpoint = `${process.env.REACT_APP_API_URL}processdata`;
      const generateTreeResponse = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const generateTree = await generateTreeResponse.json();
      console.log(generateTree);
      setLoading(false);
      if (generateTree && generateTree.dt_type) {
        dispatch(
          addMessage({
            text:
              generateTree.dt_type === 'classification'
                ? 'Decision tree (classification) generated with an accuracy of ' +
                  parseFloat(generateTree.accuracy) * 100 +
                  '%'
                : 'Decision tree (regression) generated with an error of ' +
                  parseFloat(generateTree.accuracy),
            sender: 'bot',
            info: true,
            table: true,
            tree: true,
            back: generateTree.response_filename,
            constraints: generateTree.constraints,
            output: generateTree.output_tree,
            accuracy: generateTree.accuracy,
            dt_type: generateTree.dt_type,
          })
        );
        dispatch(
          setResponseFilename({
            response_filename: generateTree.response_filename,
          })
        );
        dispatch(
          setHasTree({
            has_tree: true,
          })
        );
        const instructs = { ...instructions };
        if ('nodes_constraints' in instructs) {
          instructs.nodes_constraints = {};
        }
        dispatch(
          setInstructions({
            instructions: instructs,
          })
        );
        displayTree(generateTree.output_tree);
        scrollToBottom();
        setHasCreationdt(false);
        console.log('Tree generated successfully');
      } else {
        console.error('Failed to generate tree');
        let text = '';
        if (
          Object.prototype.toString.call(generateTree.detail) ===
          '[object String]'
        ) {
          text = '. Error details: ' + generateTree.detail;
        }
        dispatch(
          addMessage({
            text: 'Failed to generate tree' + text,
            sender: 'bot',
            info: true,
            table: true,
            tree: false,
            back: null,
          })
        );
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      dispatch(
        addMessage({
          text: 'Failed to generate tree. Error details: ' + error.message,
          sender: 'bot',
          info: true,
          table: true,
          tree: false,
          back: null,
        })
      );
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const value = inputValue.trim();
      dispatch(
        addMessage({
          text: value,
          sender: 'user',
          info: false,
          table: false,
          tree: false,
          back: null,
        })
      );
      let findMatch = false;
      let i = -1;
      for (i = 0; i < instructionsArray.length; i++) {
        if (value.toLowerCase().includes(instructionsArray[i].toLowerCase())) {
          let str = value.replace(instructionsArray[i], '');
          if (i === 4) {
            findMatch = true;
            setLoading(true);
            await generateTree();
          } else if (i === 0) {
            //features
            const cols = getColumns(str);
            if (cols.length > 0) {
              findMatch = true;
              dispatch(
                updateInstructions({
                  features: cols,
                })
              );
            }
          } else if (i === 1) {
            //target
            const cols = getColumns(str);
            if (cols.length > 0) {
              findMatch = true;
              dispatch(
                updateInstructions({
                  target: cols[0],
                })
              );
            }
          } else if (i === 2) {
            //max_depth
            const num = getNumber(str);
            if (num) {
              findMatch = true;
              dispatch(
                updateInstructions({
                  max_depth: num,
                })
              );
            }
          } else if (i === 3) {
            //min_samples_split
            const num = getNumber(str);
            if (num) {
              findMatch = true;
              dispatch(
                updateInstructions({
                  min_samples_split: num,
                })
              );
            }
          } else if (i === 5) {
            //train_size
            const num = getNumber(str);
            if (num) {
              findMatch = true;
              dispatch(
                updateInstructions({
                  train_size: num,
                })
              );
            }
          } else if (!has_tree && i >= 6 && i <= 15) {
            findMatch = true;
            dispatch(
              addMessage({
                text: 'This command can only be used after generating a decision tree.',
                sender: 'bot',
                info: true,
                table: true,
                tree: false,
                back: null,
              })
            );
            scrollToBottom();
            setInputValue('');
          } else if (hasCreationdt && i >= 6 && i <= 15) {
            findMatch = true;
            dispatch(
              addMessage({
                text: 'You cannot mix the commands used for decision tree creation and modification.',
                sender: 'bot',
                info: true,
                table: true,
                tree: false,
                back: null,
              })
            );
            scrollToBottom();
            setInputValue('');
          } else if (i === 6) {
            //set node and threshold
            let parts = value.split(' to ');
            const node_number = getNumber(parts[0]);
            let parts2 = parts[1].split('with');
            const cols = getColumns(parts2[0]);
            const threshold = getNumber(parts2[1]);
            if (node_number && threshold && cols.length > 0) {
              findMatch = true;
              const instructs = { ...instructions };
              if (!('nodes_constraints' in instructs)) {
                instructs.nodes_constraints = {};
              }
              instructs.nodes_constraints = {
                ...instructs.nodes_constraints,
              };
              if (!(node_number in instructs['nodes_constraints'])) {
                instructs['nodes_constraints'][node_number] = {};
              }
              instructs.nodes_constraints[node_number] = {
                ...instructs.nodes_constraints[node_number],
              };
              if (!('yes' in instructs['nodes_constraints'][node_number])) {
                instructs['nodes_constraints'][node_number]['yes'] = [];
              }
              instructs['nodes_constraints'][node_number]['yes'] = [
                cols[0] + ',' + threshold,
              ];
              dispatch(
                setInstructions({
                  instructions: instructs,
                })
              );
            }
          } else if (i === 7) {
            //set node and features
            let parts = value.split(' to ');
            const node_number = getNumber(parts[0]);
            let parts2 = parts[1].split('features:');
            const cols = getColumns(parts2[1]);
            if (node_number && cols.length > 0) {
              findMatch = true;
              let instructs = { ...instructions };
              if (!('nodes_constraints' in instructs)) {
                instructs.nodes_constraints = {};
              }
              instructs.nodes_constraints = {
                ...instructs.nodes_constraints,
              };
              if (!(node_number in instructs['nodes_constraints'])) {
                instructs['nodes_constraints'][node_number] = {};
              }
              instructs.nodes_constraints[node_number] = {
                ...instructs.nodes_constraints[node_number],
              };
              if (!('yes' in instructs['nodes_constraints'][node_number])) {
                instructs['nodes_constraints'][node_number]['yes'] = [];
              }
              instructs['nodes_constraints'][node_number]['yes'] = cols;
              dispatch(
                setInstructions({
                  instructions: instructs,
                })
              );
            }
          } else if (i === 8) {
            //set node and except features
            let parts = value.split(' to ');
            const node_number = getNumber(parts[0]);
            let parts2 = parts[1].split('following:');
            const cols = getColumns(parts2[1]);
            if (node_number && cols.length > 0) {
              findMatch = true;
              let instructs = { ...instructions };
              if (!('nodes_constraints' in instructs)) {
                instructs.nodes_constraints = {};
              }
              instructs.nodes_constraints = {
                ...instructs.nodes_constraints,
              };
              if (!(node_number in instructs['nodes_constraints'])) {
                instructs['nodes_constraints'][node_number] = {};
              }
              instructs.nodes_constraints[node_number] = {
                ...instructs.nodes_constraints[node_number],
              };
              if (!('no' in instructs['nodes_constraints'][node_number])) {
                instructs['nodes_constraints'][node_number]['no'] = [];
              }
              instructs['nodes_constraints'][node_number]['no'] = cols;
              dispatch(
                setInstructions({
                  instructions: instructs,
                })
              );
            }
          } else if (i === 9) {
            //remove tree
            let node_number = getNumber(str);
            if (node_number) {
              findMatch = true;
              let instructs = { ...instructions };
              if (!('nodes_constraints' in instructs)) {
                instructs.nodes_constraints = {};
              }
              instructs.nodes_constraints = {
                ...instructs.nodes_constraints,
              };
              if (!(node_number in instructs['nodes_constraints'])) {
                instructs['nodes_constraints'][node_number] = {};
              }
              instructs.nodes_constraints[node_number] = {
                ...instructs.nodes_constraints[node_number],
              };
              if (!('remove' in instructs['nodes_constraints'][node_number])) {
                instructs['nodes_constraints'][node_number]['remove'] = 'y';
              }
              dispatch(
                setInstructions({
                  instructions: instructs,
                })
              );
            }
          } else if (i === 10) {
            //root node color
            str = str.trim();
            if (str) {
              findMatch = true;
              dispatch(
                updateTreeLayout({
                  root_color: str,
                })
              );
              dispatch(
                updateInstructions({
                  root_color: str,
                })
              );
              setSidebar(true);
              setContentSidebar(3);
            }
          } else if (i === 11) {
            //root node color
            const num = getNumber(str);
            if (num) {
              findMatch = true;
              dispatch(
                updateTreeLayout({
                  root_size: num,
                })
              );
              dispatch(
                updateInstructions({
                  root_size: num,
                })
              );
              setSidebar(true);
              setContentSidebar(3);
            }
          } else if (i === 12) {
            //root branch color
            str = str.trim();
            if (str) {
              findMatch = true;
              dispatch(
                updateTreeLayout({
                  branch_color: str,
                })
              );
              dispatch(
                updateInstructions({
                  branch_color: str,
                })
              );
              setSidebar(true);
              setContentSidebar(3);
            }
          } else if (i === 13) {
            //branch node color
            const num = getNumber(str);
            if (num) {
              findMatch = true;
              dispatch(
                updateTreeLayout({
                  branch_size: num,
                })
              );
              dispatch(
                updateInstructions({
                  branch_size: num,
                })
              );
              setSidebar(true);
              setContentSidebar(3);
            }
          } else if (i === 14) {
            //root leaf color
            str = str.trim();
            if (str) {
              findMatch = true;
              dispatch(
                updateTreeLayout({
                  leaf_color: str,
                })
              );
              dispatch(
                updateInstructions({
                  leaf_color: str,
                })
              );
              setSidebar(true);
              setContentSidebar(3);
            }
          } else if (i === 15) {
            //root leaf color
            const num = getNumber(str);
            if (num) {
              findMatch = true;
              dispatch(
                updateTreeLayout({
                  leaf_size: num,
                })
              );
              dispatch(
                updateInstructions({
                  leaf_size: num,
                })
              );
              setSidebar(true);
              setContentSidebar(3);
            }
          }
          break;
        }
      }
      if (!findMatch) {
        dispatch(
          addMessage({
            text: 'I am not able to understand your request. Click on "i" to get more instructions about the commands to use to interact with me.',
            sender: 'bot',
            info: true,
            table: true,
            tree: false,
            back: null,
          })
        );
      }
      if (findMatch && i <= 5 && i !== 4) {
        setHasCreationdt(true);
      }
      if (has_tree && i >= 10 && i <= 15) {
        dispatch(
          addMessage({
            text: 'generate',
            sender: 'user',
            info: false,
            table: false,
            tree: false,
            back: null,
          })
        );
        dispatch(
          addMessage({
            text: 'Layout of decision tree updated',
            sender: 'bot',
            info: true,
            table: true,
            tree: false,
            back: null,
          })
        );
      }
      scrollToBottom();
      setInputValue('');
      //console.log(messages);
    }
  };

  const displayTree = (tree) => {
    //info: 1, table: 2, tree: 3, back: 4 ... 'reset',
    setTreeData(tree);
    setSidebar(true);
    setContentSidebar(3);
    setShowType(0);
  };
  const show = (value) => {
    setSidebar(true);
    setContentSidebar(value);
  };
  const generateFromInstructions = (message) => {
    const instructs = message.constraints;
    dispatch(
      addMessage({
        text: 'Go back to the following configuration',
        sender: 'user',
        info: false,
        table: false,
        tree: false,
        back: null,
      })
    );
    for (const [key, value] of Object.entries(instructs)) {
      let text = null;
      if (key === 'features') {
        text = instructionsArray[0] + ' ' + value.join(', ');
      } else if (key === 'target') {
        text = instructionsArray[1] + ' ' + value;
      } else if (key === 'max_depth') {
        text = instructionsArray[2] + ' ' + value;
      } else if (key === 'min_samples_split') {
        text = instructionsArray[3] + ' ' + value;
      } else if (key === 'train_size') {
        text = instructionsArray[5] + ' ' + value;
      } else if (key === 'nodes_constraints') {
        for (const [num_node, val] of Object.entries(value)) {
          for (const [k, v] of Object.entries(val)) {
            if (k === 'remove') {
              text = instructionsArray[9] + ' ' + num_node;
            } else if (k === 'no') {
              text =
                'set node ' +
                num_node +
                ' to any feature except the following: ' +
                v.join(', ');
            } else if (k === 'yes') {
              if (v.length > 1) {
                text =
                  'set node ' +
                  num_node +
                  ' to one of the following features: ' +
                  v.join(', ');
              } else {
                let vl = v[0];
                if (vl.includes(',')) {
                  const dt = vl.split(',');
                  text =
                    'set node ' +
                    dt[0] +
                    ' to ' +
                    dt[1] +
                    ' with a threshold of ' +
                    dt[2];
                } else {
                  text =
                    'set node ' +
                    num_node +
                    ' to one of the following features: ' +
                    v.join(', ');
                }
              }
            }
            if (text) {
              dispatch(
                addMessage({
                  text: text,
                  sender: 'user',
                  info: false,
                  table: false,
                  tree: false,
                  back: null,
                })
              );
            }
          }
        }
      } else if (key === 'root_color') {
        text = instructionsArray[10] + ' ' + value;
      } else if (key === 'root_size') {
        text = instructionsArray[11] + ' ' + value;
      } else if (key === 'branch_color') {
        text = instructionsArray[12] + ' ' + value;
      } else if (key === 'branch_size') {
        text = instructionsArray[13] + ' ' + value;
      } else if (key === 'leaf_color') {
        text = instructionsArray[14] + ' ' + value;
      } else if (key === 'leaf_size') {
        text = instructionsArray[15] + ' ' + value;
      }
      if (text && key !== 'nodes_constraints') {
        dispatch(
          addMessage({
            text: text,
            sender: 'user',
            info: false,
            table: false,
            tree: false,
            back: null,
          })
        );
      }
    }
    let text = 'generate';
    if (Object.keys(instructs).length === 0) {
      text = 'generate without any constraints';
    }
    dispatch(
      addMessage({
        text: text,
        sender: 'user',
        info: false,
        table: false,
        tree: false,
        back: null,
      })
    );
    dispatch(addMessage(message));
    displayTree(message.output);
    scrollToBottom();
  };
  const backInstructions = (message) => {
    dispatch(
      setInstructions({
        instructions: message.constraints,
      })
    );
    dispatch(
      setResponseFilename({
        response_filename: message.back,
      })
    );
    generateFromInstructions(message);
  };

  return (
    <div className='w-full pt-5 px-2 absolute -top-5'>
      <div className='flex h-screen pt-16'>
        {/* Left Sidebar */}
        {sidebar && (
          <div className='w-full sm:w-full md:w-3/5 p-4 overflow-y-auto overflow-x-auto shadow-md'>
            <div className='avatar placeholder relative top-2 float-right'>
              {contentSidebar === 3 && (
                <>
                  <div
                    className='bg-neutral text-white rounded-full w-8 shadow-md cursor-pointer mr-1'
                    title='Go back to initial tree'
                    onClick={() => {
                      setShowType(0);
                    }}
                  >
                    <span className='text-xs'>Back</span>
                  </div>
                  <div
                    className='bg-primary text-white rounded-full w-8 shadow-md cursor-pointer mr-1'
                    title='Display the variation of the Gini index throughout the tree'
                    onClick={() => {
                      setShowType(1);
                    }}
                  >
                    <span className='text-xs'>Gini</span>
                  </div>
                  <div
                    className='bg-primary text-white rounded-full w-8 shadow-md cursor-pointer mr-1'
                    title='Display the variation of the variance reduction throughout the tree'
                    onClick={() => {
                      setShowType(2);
                    }}
                  >
                    <span className='text-xs'>Var</span>
                  </div>
                  <div
                    className='bg-primary text-white rounded-full w-8 shadow-md cursor-pointer mr-1'
                    title='Display the variation of the number of samples throughout the tree'
                    onClick={() => {
                      setShowType(3);
                    }}
                  >
                    <span className='text-xs'>#Sp</span>
                  </div>
                </>
              )}
              <div
                className='bg-red-500 text-white rounded-full w-8 shadow-md cursor-pointer'
                onClick={() => {
                  setSidebar(false);
                }}
                title='Close sidebar'
              >
                <span className='text-xs'>X</span>
              </div>
            </div>
            {contentSidebar === 1 && <Instructions />}
            {contentSidebar === 2 && <TableComponent />}
            {contentSidebar === 3 && (
              <DecisionTree treeData={treeData} showType={showType} />
            )}
          </div>
        )}

        {/* Chat Container */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Chat Content */}
          <div className='flex-1 overflow-y-auto p-4' ref={divRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat ${
                  message.sender === 'user' ? 'chat-end' : 'chat-start'
                }`}
              >
                <div className='chat-image avatar'>
                  <div className='w-10 rounded-full'>
                    {message.sender === 'user' ? (
                      <img alt='user' src='images/user.png' />
                    ) : (
                      <img alt='bot' src='images/bot.png' />
                    )}
                  </div>
                </div>
                <div
                  className={`chat-bubble ${
                    message.sender === 'user' ? 'chat-bubble-primary' : ''
                  }`}
                >
                  {message.text}
                </div>

                {message.sender === 'bot' && (
                  <div className='chat-footer opacity-50 flex gap-3'>
                    {message.info && (
                      <img
                        alt='info'
                        onClick={() => {
                          show(1);
                        }}
                        title='Show Instructions'
                        className='w-6 cursor-pointer'
                        src='data:image/png;base64,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'
                      />
                    )}
                    {message.table && (
                      <img
                        alt='Table'
                        onClick={() => {
                          show(2);
                        }}
                        title='Show Table'
                        className='w-6 cursor-pointer'
                        src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAeVJREFUeF7tm88uQ1EQxn8lYYF3sPb3GUQsWPvzACSIIBGvQRHCggfAnkTEM1iUtWdo2RAhk/QmDXo7bYlMz9ftnZ7M991v5syZe6ZA4r9C4vgRAVLAdwZGgSVgEhgE+oKT9AI8AbfAKVCqxVMbAr1AEVgGuoKDruf+O3ACbAGvZpQRYOCvgYkOBf4V1h0wbSRkBBwDK4mAz2AeAutGgMX8fQfLPi8cxo2AfWAjsbefwS0aAQ/AUKIElIyACtCfKAEVI+CjAXhvtTgHXOSsZc8WnESfA/M5tvbs0rlWLj4RIAUoBJQDlAS1C+QzkPw26NxuY5p56oCYyJxeiwBHIeTkMqaZFCAFNC6FY2rb6bVCwBECyRdCIsAZTuoIqSWmnqCaouoKd2Jb3LkJxDRTJeioBGO+WqfXUoAUoONwwy9DzmiKaaYc4MgB/3Ectm//synfDxABUoBCQDlASVC7QH0GfvWaXBkYiFnHte11WVdlgT1gs20uYy6wawoYqV6X746JoWWvbXpkLKvzbXhgreWlYv7xwJSfEdADXFUHpWLCac5rG6CaAd5qT3pGwg6wCnRqOJjsj4BtA2+c/XTUHQYWganq2Fz0WYLn6tjcDXAGPNaKxXvWb05ggaxFQKCX9SeuJq+AT0EKyxIwCSIfAAAAAElFTkSuQmCC'
                      />
                    )}
                    {message.tree && (
                      <img
                        alt='Tree'
                        onClick={() => {
                          displayTree(message.output);
                        }}
                        title='Show Tree'
                        className='w-6 cursor-pointer'
                        src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMiIgaWQ9Imljb24iIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDpub25lO308L3N0eWxlPjwvZGVmcz48dGl0bGUvPjxwYXRoIGQ9Ik0yMyw5aDZhMiwyLDAsMCwwLDItMlYzYTIsMiwwLDAsMC0yLTJIMjNhMiwyLDAsMCwwLTIsMlY0SDExVjNBMiwyLDAsMCwwLDksMUgzQTIsMiwwLDAsMCwxLDNWN0EyLDIsMCwwLDAsMyw5SDlhMiwyLDAsMCwwLDItMlY2aDRWMjZhMi4wMDIzLDIuMDAyMywwLDAsMCwyLDJoNHYxYTIsMiwwLDAsMCwyLDJoNmEyLDIsMCwwLDAsMi0yVjI1YTIsMiwwLDAsMC0yLTJIMjNhMiwyLDAsMCwwLTIsMnYxSDE3VjE3aDR2MWEyLDIsMCwwLDAsMiwyaDZhMiwyLDAsMCwwLDItMlYxNGEyLDIsMCwwLDAtMi0ySDIzYTIsMiwwLDAsMC0yLDJ2MUgxN1Y2aDRWN0EyLDIsMCwwLDAsMjMsOVptMC02aDZWN0gyM1pNOSw3SDNWM0g5Wk0yMywyNWg2djRIMjNabTAtMTFoNnY0SDIzWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAwLjAwNDkpIi8+PHJlY3QgY2xhc3M9ImNscy0xIiBkYXRhLW5hbWU9IiZsdDtUcmFuc3BhcmVudCBSZWN0YW5nbGUmZ3Q7IiBoZWlnaHQ9IjMyIiBpZD0iX1RyYW5zcGFyZW50X1JlY3RhbmdsZV8iIHdpZHRoPSIzMiIvPjwvc3ZnPg=='
                      />
                    )}
                    {message.back && (
                      <img
                        alt='Back'
                        onClick={() => {
                          backInstructions(message);
                        }}
                        title='Go Back to this configuration'
                        className='w-5 cursor-pointer'
                        src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyMHB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxNiAyMCIgd2lkdGg9IjE2cHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzAwMDAwMCIgaWQ9IkNvcmUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00MjQuMDAwMDAwLCAtNDYzLjAwMDAwMCkiPjxnIGlkPSJ1bmRvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MjQuMDAwMDAwLCA0NjQuMDAwMDAwKSI+PHBhdGggZD0iTTgsMyBMOCwtMC41IEwzLDQuNSBMOCw5LjUgTDgsNSBDMTEuMyw1IDE0LDcuNyAxNCwxMSBDMTQsMTQuMyAxMS4zLDE3IDgsMTcgQzQuNywxNyAyLDE0LjMgMiwxMSBMMCwxMSBDMCwxNS40IDMuNiwxOSA4LDE5IEMxMi40LDE5IDE2LDE1LjQgMTYsMTEgQzE2LDYuNiAxMi40LDMgOCwzIEw4LDMgWiIgaWQ9IlNoYXBlIi8+PC9nPjwvZz48L2c+PC9zdmc+'
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div key={0} className='chat chat-start'>
                <div className='chat-image avatar'>
                  <div className='w-10 rounded-full'>
                    <img alt='bot' src='images/bot.png' />
                  </div>
                </div>
                <div className='chat-bubble'>Loading ...</div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className='flex-shrink-0 p-4 border-t bg-white flex items-center'>
            <input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Type your message...'
              className='flex-1 p-2 border rounded-l-md'
            />
            <button
              onClick={handleSendMessage}
              className={`px-4 py-2 bg-blue-500 text-white rounded-r-md cursor-pointer ${
                loading ? 'btn-disabled' : ''
              }`}
            >
              {loading ? 'Processing ...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
