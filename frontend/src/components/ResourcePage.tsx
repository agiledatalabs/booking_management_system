import { useModal } from "../hooks/use-modal-store"

const ResourcePage = () => {
    const { onOpen } = useModal();
  return (
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
  )
}

export default ResourcePage
