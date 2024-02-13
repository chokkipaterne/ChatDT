import React, { useState } from 'react';

const Autocomplete = ({
  suggestions,
  inputValue,
  setInputValue,
  filteredSuggestions,
  setFilteredSuggestions,
  setShowSuggestions,
  showSuggestions,
}) => {
  const [suggestionClicked, setSuggestionClicked] = useState(false);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    // Filter suggestions based on input value
    let filtered = [];
    if (value.toLowerCase() === '') {
      filtered = [];
    } else {
      filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
    }
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
    setSuggestionClicked(false); // Reset suggestionClicked when input changes
  };

  const handleSuggestionClick = (suggestion) => {
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
        onBlur={handleInputBlur}
        placeholder='Type something...'
        className='border p-2 rounded-l-md w-full'
      />
      {showSuggestions && (
        <ul className='suggestion-list'>
          {filteredSuggestions.map((suggestion, index) => (
            <li
              className='suggestion-item'
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
