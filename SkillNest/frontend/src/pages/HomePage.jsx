import { Link } from 'react-router-dom';
import homeImage from '../assets/home.jpg';

export default function HomePage() {
  return (
    <div className="font-sans bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">SkillNest</h1>
          <div className="space-x-4">
            <Link to="/" className="text-sm font-medium hover:text-blue-700">Home</Link>
            <Link to="/login" className="text-sm font-medium hover:text-blue-700">Login</Link>
            <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4 leading-tight">Build Your Personal Learning Portfolio</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          SkillNest empowers learners to showcase their skills, experiences, and progress. Build a professional profile and share your journey with the world.
        </p>
        <Link to="/login">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 shadow-lg transition">
            Get Started
          </button>
        </Link>
        <img src={homeImage} alt="ePortfolio Illustration" className="w-full max-w-4xl mx-auto mt-12" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-800">Why Choose SkillNest?</h2>
          <p className="text-gray-600 mt-4 text-lg">Empowering you to reflect, grow, and showcase your academic and professional journey.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Visual Resume</h3>
            <p>Create a personalized digital profile that stands out to employers and educators.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Learning Showcase</h3>
            <p>Highlight your projects, documents, and accomplishments with multimedia support.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Skills & Progress</h3>
            <p>Track your growth and tag evidence with relevant skills to show real learning.</p>
          </div>
        </div>
      </section>

      {/* Testimonial / Video Section */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-blue-800 mb-4">A Platform That Supports Your Growth</h2>
            <p className="text-gray-700 text-lg mb-6">SkillNest is designed for students and professionals to document learning, connect skills to achievements, and tell their unique story through a lifelong portfolio.</p>
            <ul className="text-gray-600 list-disc list-inside space-y-2">
              <li>Custom showcases with documents & media</li>
              <li>Public portfolio for job-ready branding</li>
              <li>Responsive, user-friendly UI</li>
            </ul>
          </div>
          <iframe
          className="rounded-lg w-full h-64 md:h-80 shadow-lg"
          src="https://www.youtube.com/embed/l8rq1Gff06w"
          title="SkillNest Intro Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Call to Action */}
      <footer className="bg-blue-800 text-white py-16 text-center">
        <h3 className="text-3xl font-bold mb-4">Join thousands building their digital portfolios on SkillNest</h3>
        <Link to="/register">
          <button className="bg-white text-blue-800 font-semibold px-8 py-3 rounded-full hover:bg-gray-200 transition">
            Create Your Account
          </button>
        </Link>
      </footer>
    </div>
  );
}
