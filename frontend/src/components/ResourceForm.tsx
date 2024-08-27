import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookingType } from '../types/enums'; // Adjust the import path

interface ResourceType {
  id: string;
  name: string;
}

interface ResourceFormProps {
  onRequestClose: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ onRequestClose }) => {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [resourceTypeId, setType] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [maxQty, setMaxQty] = useState(1);
  const [priceInternal, setPriceInternal] = useState('');
  const [priceExternal, setPriceExternal] = useState('');
  const [bookingType, setBookingType] = useState<BookingType>(BookingType.TYPE1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const fetchResourceTypes = async () => {
      try {
        console.log("fetching resource types")
        const response = await axios.get('/api/resource-types');
        setResourceTypes(response.data);
      } catch (error) {
        console.error('Error fetching resource types:', error);
      }
    };

    fetchResourceTypes();
  }, []);

  const handleAddResource = async () => {
    if (maxQty < 0) {
      alert('Max Quantity cannot be less than 0');
      return;
    }
    const formData = {
      name,
      resourceTypeId,
      maxQty,
      priceInternal: parseInt(priceInternal, 10),
      priceExternal: parseInt(priceExternal, 10),
      bookingType,
      active
    };

    try {

      const data = await axios.post('/api/resources', formData
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // },
      );
      console.log('Resource created:', data);
      alert('Resource Created!');
      onRequestClose(); // Close the modal upon successful submission
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  return (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      handleAddResource(); 
    }}>
      <div className="mb-4">
        <label htmlFor="resourceTypeId" className="block text-sm font-medium text-gray-700">Resource Type</label>
        <select
          id="resourceTypeId"
          value={resourceTypeId ?? ''}
          onChange={(e) => setType(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select a resource type</option>
          {resourceTypes.map((resourceTypeId) => (
            <option key={resourceTypeId.id} value={resourceTypeId.id}>{resourceTypeId.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Resource Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="maxQty" className="block text-sm font-medium text-gray-700">Max Quantity</label>
        <input
          type="number"
          id="maxQty"
          value={maxQty}
          onChange={(e) => setMaxQty(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="priceInternal" className="block text-sm font-medium text-gray-700">Internal Price</label>
        <div className="flex items-center mt-1">
          <span className="mr-2">₹</span>
          <input
            type="text"
            id="priceInternal"
            value={priceInternal}
            onChange={(e) => setPriceInternal(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="priceExternal" className="block text-sm font-medium text-gray-700">External Price</label>
        <div className="flex items-center mt-1">
          <span className="mr-2">₹</span>
          <input
            type="text"
            id="priceExternal"
            value={priceExternal}
            onChange={(e) => setPriceExternal(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="bookingType" className="block text-sm font-medium text-gray-700">Booking Type</label>
        <select
          id="bookingType"
          value={bookingType}
          onChange={(e) => setBookingType(e.target.value as BookingType)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        >
          {Object.values(BookingType).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="active" className="block text-sm font-medium text-gray-700">Active</label>
        <input
          type="checkbox"
          id="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="mt-1 block"
        />
      </div>
      <button type="submit" className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Add Resource
      </button>
    </form>
  );
};

export default ResourceForm;