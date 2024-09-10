import { useModal } from "../hooks/use-modal-store"
import UserCard from "./UserCard";

interface UserProps {
    userType: 'Admin' | 'Internal User' | 'External User';
    id: string;
    name: string;
    email: string;
    mobile: string;
    designation: string;
    institute: string;
    photograph: string;
  }

const Users = () => {
    const { onOpen } = useModal();

    const dummyData: UserProps[] = [
        {
          userType: 'Admin',
          id: 'A123',
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          mobile: '123-456-7890',
          designation: 'System Administrator',
          institute: 'XYZ Institute',
          photograph: 'https://plus.unsplash.com/premium_photo-1682023585957-f191203ab239?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
          userType: 'Internal User',
          id: 'B456',
          name: 'Bob Smith',
          email: 'bob.smith@example.com',
          mobile: '234-567-8901',
          designation: 'Software Engineer',
          institute: 'ABC Institute',
          photograph: 'https://plus.unsplash.com/premium_photo-1682023585957-f191203ab239?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
          userType: 'External User',
          id: 'C789',
          name: 'Charlie Brown',
          email: 'charlie.brown@example.com',
          mobile: '345-678-9012',
          designation: 'Consultant',
          institute: 'LMN Institute',
          photograph: 'https://plus.unsplash.com/premium_photo-1682023585957-f191203ab239?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }
      ];

    const handleEdit = (id: string) => {
      console.log(`Edit clicked for resource with ID: ${id}`);
    };
  
    const handleDelete = (id: string) => {
      console.log(`Delete clicked for resource with ID: ${id}`);
    };
  return (
    <>
      <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Manage Users</h1>
        <div className="flex justify-around mb-6">
          <button
            onClick={() => onOpen('addUser')}
            className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add User
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
      {dummyData.map((item) => (
        <UserCard
          key={item.id}
          userType={item.userType}
          id={item.id}
          name={item.name}
          email={item.email}
          mobile={item.mobile}
          designation={item.designation}
          institute={item.institute}
          photograph={item.photograph}
          onEdit={() => handleEdit(item.id)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
    </>
  )
}

export default Users;
