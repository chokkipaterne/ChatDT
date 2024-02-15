import React, { useEffect, useState } from 'react';

const Autocomplete = ({
  suggestions,
  inputValue,
  setInputValue,
  filteredSuggestions,
  setFilteredSuggestions,
  setShowSuggestions,
  showSuggestions,
  handleSendMessage,
}) => {
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    setFocusedIndex(0); // Reset focused index when input value changes
  }, [inputValue]);

  const removeWordsInBrackets = (sentence) => {
    // Define a regular expression to match words between square brackets
    const regex = /\[[^\]]+\]/g;
    // Replace all occurrences of words between square brackets with an empty string
    const cleanedSentence = sentence.replace(regex, '_');
    return cleanedSentence;
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    // Filter suggestions based on input value
    let filtered = [];
    if (value.toLowerCase() === '') {
      filtered = [];
    } else {
      filtered = suggestions.filter((suggestion) => {
        let words = value.split(' ');
        let find = false;
        for (let i = 0; i < words.length; i++) {
          let myword = words[i].trim();
          if (
            myword.includes('@') &&
            suggestion.toLowerCase().includes(myword.toLowerCase())
          ) {
            find = true;
            break;
          }
        }

        return suggestion.toLowerCase().includes(value.toLowerCase()) || find;
      });
    }
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
    setSuggestionClicked(false); // Reset suggestionClicked when input changes
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Tab' && showSuggestions && focusedIndex !== -1) {
      handleSuggestionClick(filteredSuggestions[focusedIndex]);
      event.preventDefault();
    } else if (event.key === 'ArrowUp' && showSuggestions) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredSuggestions.length - 1)
      );
    } else if (event.key === 'Enter' && focusedIndex !== -1) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setSuggestionClicked(true);
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion || suggestion.length == 0 || suggestion == undefined) {
      return;
    }
    if (suggestion.includes('@')) {
      let inptval = inputValue;
      let words = inptval.split(' ');
      for (let i = 0; i < words.length; i++) {
        let myword = words[i].trim();
        if (
          myword.includes('@') &&
          suggestion.toLowerCase().includes(myword.toLowerCase())
        ) {
          inptval = inptval.replaceAll(myword, suggestion);
        }
      }
      suggestion = inptval;
    }
    suggestion = suggestion.replaceAll('@', '');
    suggestion = removeWordsInBrackets(suggestion);
    setInputValue(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setSuggestionClicked(true); // Set suggestionClicked to true after suggestion is clicked
  };

  const handleInputBlur = () => {
    if (suggestionClicked) {
      setSuggestionClicked(false); // Reset suggestionClicked when input loses focus
    }
  };

  return (
    <div style={{ position: 'relative' }} className='flex-1'>
      <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        placeholder='Type something...'
        className='border p-2 rounded-l-md w-full'
      />
      {showSuggestions && (
        <ul className='suggestion-list'>
          {filteredSuggestions.map((suggestion, index) => (
            <li
              className={`suggestion-item ${
                focusedIndex === index ? 'item-active' : ''
              }`}
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
