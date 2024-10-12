import React from 'react';
import AttributeDropdown from './AttributeDropdown';

const AttributeSelector = ({ attribute, onChange }) => {
  const typeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Select' },
  ];

  const handleTypeChange = (selectedOption) => {
    onChange({ ...attribute, type: selectedOption.value });
  };

  return (
    <div className="attribute-selector">
      <span className="attribute-name">{attribute.name}</span>
      <AttributeDropdown
        options={typeOptions}
        value={typeOptions.find(option => option.value === attribute.type)}
        onChange={handleTypeChange}
        placeholder="Select type"
      />
      {/* Add more dropdowns for other attribute properties as needed */}
    </div>
  );
};

export default AttributeSelector;
