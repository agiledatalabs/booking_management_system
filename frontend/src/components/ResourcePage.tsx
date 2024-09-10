import { useModal } from "../hooks/use-modal-store"
import ResourceCard from "./ResourceCard";

const ResourcePage = () => {
    const { onOpen } = useModal();

    const dummyData = [
      {
        id: 1,
        date: '2024-09-10',
        resourceType: 'Type A',
        resourceName: 'Resource 1',
        timeSlot: '10:00 AM - 11:00 AM',
        quantity: '5'
      },
      {
        id: 2,
        date: '2024-09-11',
        resourceType: 'Type B',
        resourceName: 'Resource 2',
        timeSlot: '01:00 PM - 02:00 PM',
        quantity: '3'
      },
      {
        id: 3,
        date: '2024-09-12',
        resourceType: 'Type C',
        resourceName: 'Resource 3',
        timeSlot: '03:00 PM - 04:00 PM',
        quantity: '8'
      }
    ];
  
    const handleEdit = (id: Number) => {
      console.log(`Edit clicked for resource with ID: ${id}`);
    };
  
    const handleDelete = (id: Number) => {
      console.log(`Delete clicked for resource with ID: ${id}`);
    };
  return (
    <>
      <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Manage Resources</h1>
        <div className="flex justify-around mb-6">
        <button
            onClick={() => onOpen('addResourceType')}
            className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Resource Type
          </button>
          <button
            onClick={() => onOpen('addResource')}
            className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Resource
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
      {dummyData.map((item) => (
        <ResourceCard
          key={item.id}
          date={item.date}
          resourceType={item.resourceType}
          resourceName={item.resourceName}
          timeSlot={item.timeSlot}
          quantity={item.quantity}
          onEdit={() => handleEdit(item.id)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
    </>
  )
}

export default ResourcePage
