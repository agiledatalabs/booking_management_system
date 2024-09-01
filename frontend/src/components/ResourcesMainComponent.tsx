import React, { useState } from 'react';
import ResourceModal from './ResourceModal';
import ResourceTypeModal from './ResourceTypeModal';

const AddResourcePage: React.FC = () => {
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isResourceTypeModalOpen, setIsResourceTypeModalOpen] = useState(false);

  return (
    <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Manage Resources</h1>
      <div className="flex justify-around mb-6">
        <button
          onClick={() => setIsResourceTypeModalOpen(true)}
          className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Resource Type
        </button>
        <button
          onClick={() => setIsResourceModalOpen(true)}
          className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Resource
        </button>
      </div>
      <ResourceTypeModal
        isOpen={isResourceTypeModalOpen}
        onRequestClose={() => setIsResourceTypeModalOpen(false)}
      />
      <ResourceModal
        isOpen={isResourceModalOpen}
        onRequestClose={() => setIsResourceModalOpen(false)}
      />
    </div>
  );
};

export default AddResourcePage;
