import { Link } from 'react-router-dom';

const RecommendationsPage = () => {
  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-700">Recommendations</h3>
        <button className="text-sm text-blue-600 hover:underline">Change Title</button>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        This section displays recommendations or compliments you have received.
      </p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 text-sm">
        📧 Request a Recommendation
      </button>
      <p className="text-sm text-gray-500 mt-6">No Recommendations Received</p>
      <div className="mt-6">
        <Link to="/profile" className="text-blue-600 hover:underline">
          ← Back to Profile
        </Link>
      </div>
    </div>
  );
};

export default RecommendationsPage;