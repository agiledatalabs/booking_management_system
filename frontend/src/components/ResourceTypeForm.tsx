import React, { useState } from 'react';
import axios from 'axios';

interface ResourceTypeFormProps {
  onRequestClose: () => void;
}

const ResourceTypeForm: React.FC<ResourceTypeFormProps> = ({ onRequestClose }) => {
  const [resourceTypeName, setResourceTypeName] = useState('');

  const handleAddResourceType = async () => {
    console.log('handleAddResourceType called'); // Log to check if function is called
    try {
      const response = await axios.post('/api/resource-types', { name: resourceTypeName });
      console.log('Resource Type Added:', response.data);
      onRequestClose(); // Close the modal upon successful submission
    } catch (error) {
      console.error('Error adding resource type:', error);
    }
  };

  return (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted'); // Log to check if form submission is triggered
      handleAddResourceType(); 
    }}>
      <div className="mb-4">
        <label htmlFor="resourceTypeName" className="block text-sm font-medium text-gray-700">Resource Type Name</label>
        <input
          type="text"
          id="resourceTypeName"
          value={resourceTypeName}
          onChange={(e) => setResourceTypeName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <button type="submit" className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Add Resource Type
      </button>
    </form>
  );
};

export default ResourceTypeForm;