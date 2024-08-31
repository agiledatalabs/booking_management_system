import React from 'react';
import Modal from 'react-modal';
import ResourceForm from './ResourceForm';

interface ResourceModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Resource"
    >
      <h2 className="text-2xl font-bold mb-4">Add Resource</h2>
      <ResourceForm onRequestClose={onRequestClose} />
      <button
        onClick={onRequestClose}
        className="mt-4 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Close
      </button>
    </Modal>
  );
};

export default ResourceModal;
