import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from './ui/button';

interface ResourceCardProps {
    date: string;
    resourceType: string;
    resourceName: string;
    timeSlot: string;
    quantity: string;
    onEdit: () => void;
    onDelete: () => void;
}

const ResourceCard = ({ date, resourceType, resourceName, timeSlot, quantity, onEdit, onDelete }: ResourceCardProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex justify-between px-24 items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">{resourceName}</h2>
          <p className="text-sm text-gray-600">{resourceType}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onEdit} className="p-2">
            <FaEdit className="text-blue-500" />
          </Button>
          <Button onClick={onDelete} className="p-2">
            <FaTrash className="text-red-500" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between px-24">
        <div>
          <p className="text-sm font-medium">Time Slot:</p>
          <p className="text-sm text-gray-700">{timeSlot}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Quantity:</p>
          <p className="text-sm text-gray-700">{quantity}</p>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
