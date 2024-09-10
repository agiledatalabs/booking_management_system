import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from './ui/button';

interface UserCardProps {
  userType: 'Admin' | 'Internal User' | 'External User';
  id: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  institute: string;
  photograph: string;
  onEdit: () => void;
  onDelete: () => void;
}

const UserCard = ({
  userType,
  id,
  name,
  email,
  mobile,
  designation,
  institute,
  photograph,
  onEdit,
  onDelete
}: UserCardProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center">
      <img src={photograph} alt={`${name}'s photograph`} className="w-16 h-16 rounded-full mr-4" />
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-gray-600">User Type: {userType}</p>
        <p className="text-sm text-gray-600">ID: {id}</p>
        <p className="text-sm text-gray-600">Email: {email}</p>
        <p className="text-sm text-gray-600">Mobile: {mobile}</p>
        <p className="text-sm text-gray-600">Designation: {designation}</p>
        <p className="text-sm text-gray-600">Institute: {institute}</p>
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
  );
};

export default UserCard;
