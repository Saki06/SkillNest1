import { Link } from 'react-router-dom';

const ShowcasesPage = () => {
  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-700">Showcases</h3>
        <button className="text-sm text-blue-600 hover:underline">Change Title</button>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Add showcases to present your experiences and competencies in detail.
      </p>
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 cursor-pointer">
        <div className="text-5xl text-green-600 mb-2">+</div>
        <p className="font-medium text-gray-700">Add New Showcase</p>
      </div>
      <div className="mt-6">
        <Link to="/profile" className="text-blue-600 hover:underline">
          ← Back to Profile
        </Link>
      </div>
    </div>
  );
};

export default ShowcasesPage;