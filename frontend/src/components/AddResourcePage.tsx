import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ResourceType {
  id: string;
  name: string;
}

const AddResourcePage: React.FC = () => {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [resourceTypeId, setResourceTypeId] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const fetchResourceTypes = async () => {
      try {
        const response = await axios.get('/api/resource-types');
        setResourceTypes(response.data);
      } catch (error) {
        console.error('Error fetching resource types:', error);
      }
    };

    fetchResourceTypes();
  }, []);

  const handleAddResource = async () => {
    try {
      const response = await axios.post('/api/resources', {
        resourceTypeId,
        name: resourceName,
        description,
        createdAt,
      });
      console.log('Resource Added:', response.data);
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Add Resource</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleAddResource(); }}>
        <div className="mb-4">
          <label htmlFor="resourceTypeId" className="block text-sm font-medium text-gray-700">Resource Type</label>
          <select
            id="resourceTypeId"
            value={resourceTypeId}
            onChange={(e) => setResourceTypeId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a resource type</option>
            {resourceTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="resourceName" className="block text-sm font-medium text-gray-700">Resource Name</label>
          <input
            type="text"
            id="resourceName"
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">Created At</label>
          <input
            type="date"
            id="createdAt"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Add Resource
        </button>
      </form>
    </div>
  );
};

export default AddResourcePage;