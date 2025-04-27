import { useState, useEffect } from 'react';
import API from '../api/axios';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [bio, setBio] = useState('Write something about yourself here, such as academic and career goals and your hobbies. Use hashtags to label your skills, experiences and competencies, for example, #Teaching, #PublicSpeaking, #Java.');
  const [tagline, setTagline] = useState('Write a tagline here.');
  const [skills, setSkills] = useState(['Developer']);
  const [newSkill, setNewSkill] = useState('');
  const [user, setUser] = useState(null);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    console.log("📦 savedUser:", savedUser);
    const userId = savedUser?._id || savedUser?.id;
    if (savedUser?.id) {
      API.get(`/auth/users/${userId}`)
        .then(res => setUser(res.data))
        .catch(err => console.error("Failed to fetch user:", err));
    }
  }, []);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("coverImage", file);
  
    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user")).id;
  
      const res = await API.post(`/auth/users/${userId}/cover`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setUser(res.data);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const sectionVisible = (tabName) => activeTab === null || activeTab === tabName;

  if (!user) return <div className="text-center p-10">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">SkillNest</h1>
          <nav className="space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">Home</a>
            <a href="#" className="hover:text-blue-600">Courses</a>
            <a href="#" className="hover:text-blue-600">Search</a>
          </nav>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-4 py-8 flex gap-6">
        <aside className="w-64 bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">SkillNest Menu</h2>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li>
              <button 
                onClick={() => setActiveTab(null)} 
                className={`block w-full text-left ${activeTab === null ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
              >
                All Sections
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('about')} 
                className={`block w-full text-left ${activeTab === 'about' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
              >
                About
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('skills')} 
                className={`block w-full text-left ${activeTab === 'skills' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
              >
                Skills
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('documents')} 
                className={`block w-full text-left ${activeTab === 'documents' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
              >
                Documents
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('showcases')} 
                className={`block w-full text-left ${activeTab === 'showcases' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
              >
                Showcases
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('recommendations')} 
                className={`block w-full text-left ${activeTab === 'recommendations' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
              >
                Recommendations
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('posts')} 
                className={`block w-full text-left ${activeTab === 'posts' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
              >
                My SkillNest Posts
              </button>
            </li>
          </ul>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${user?.coverImage || '/assets/cover.jpg'})` }}>
              <input
                type="file"
                id="coverUpload"
                accept="image/*"
                hidden
                onChange={handleCoverUpload}
              />
              <button
                onClick={() => document.getElementById('coverUpload').click()}
                className="absolute top-3 right-3 bg-white px-3 py-1 text-sm rounded shadow hover:bg-gray-100"
              >
                Add cover image
              </button>
            </div>

            <div className="p-6 relative">
              <div className="absolute top-[-40px] left-6">
                <div className="relative">
                  <img src="/assets/avatar.png" alt="avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
                  <div className="absolute bottom-0 right-0 bg-green-600 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-bold cursor-pointer">+</div>
                </div>
              </div>
              <div className="ml-32">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                  <span>🇱🇰</span>
                  <button className="text-blue-600 hover:underline text-sm">Edit</button>
                </div>
                <p className="text-sm text-blue-600 hover:underline">+ Add a headline</p>
                <div className="text-sm text-gray-500 mt-1 flex gap-4">
                  <a href="#" className="hover:underline">{user.email}</a>
                  <span>📅 Joined {user.date}</span>
                  <span>⏱ Last Visit: 1 sec</span>
                </div>
                <div className="mt-2 flex gap-4 text-sm text-blue-600">
                  <button className="hover:underline">Show Public View</button>
                  <button className="hover:underline">Privacy Settings</button>
                  <button className="hover:underline">Who Viewed My ePortfolio?</button>
                  <button className="hover:underline">+ Link to Websites</button>
                </div>
                <div className="flex items-center gap-8 mt-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">101</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">0</p>
                    <p className="text-gray-500">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">0</p>
                    <p className="text-gray-500">Followers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {sectionVisible('about') && (
            <div className="bg-white p-6 shadow rounded-xl">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">About</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Bio</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    rows="5"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                  <label className="block mb-2 font-medium text-gray-700">Tagline</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Resume</h4>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      + Upload your Resume
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Autofill enabled from resume uploads. Review and edit content if needed.</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Transcript</h4>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      + Upload your transcripts
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Video Bio</h4>
                  <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 mb-6">
                    Choose file
                  </button>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Basic Information</h4>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Country/Region:</span> Sri Lanka</p>
                    <p><span className="font-medium">Field of Study:</span> {user.profession}</p>

                    <h4 className="font-semibold text-gray-700 mt-4">Internship/Tutoring</h4>
                    <p><span className="font-medium">Seeking Internship In:</span> not filled yet</p>
                    <p><span className="font-medium">Tutoring:</span> not filled yet</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sectionVisible('skills') && (
            <div className="bg-white p-6 shadow rounded-xl">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Skills</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                />
                <button
                  onClick={handleAddSkill}
                  className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sectionVisible('documents') && (
            <div className="bg-white p-6 shadow rounded-xl">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">Documents</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your resume, certificates, transcripts and work samples here.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  + Upload Resume
                </button>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  + Upload Transcript
                </button>
              </div>
            </div>
          )}

          {sectionVisible('showcases') && (
            <div className="bg-white p-6 shadow rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-700">Showcases</h3>
                <button className="text-sm text-blue-600 hover:underline">Change Title</button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Add showcases to present your experiences and competencies in detail. For example, document a project, internship, or service experience. Each showcase has its unique URL and visibility setting.
              </p>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 cursor-pointer">
                <div className="text-5xl text-green-600 mb-2">+</div>
                <p className="font-medium text-gray-700">Add New Showcase</p>
                <p className="text-sm text-gray-500 mt-1">
                  First, create a summary card. Then add detailed sections.
                </p>
              </div>
              <div className="mt-4 text-sm text-blue-600 hover:underline cursor-pointer">
                + Sort Showcases
              </div>
            </div>
          )}

          {sectionVisible('recommendations') && (
            <div className="bg-white p-6 shadow rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-700">Recommendations</h3>
                <button className="text-sm text-blue-600 hover:underline">Change Title</button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This section displays recommendations or compliments you have received from others. Use the button below to request recommendations from your faculty, academic advisors, classmates, and supervisors who can speak to your strengths.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 text-sm">
                📧 Request a Recommendation
              </button>
              <p className="text-sm text-gray-500 mt-6">No Recommendations Received</p>

              <div className="mt-10">
                <h4 className="font-bold text-lg text-gray-800 mb-4">Sections You May Want To Add:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {['Overview', 'Expertise', 'Badge', 'Experience', 'Education', 'Courses', 'Research', 'Publications', 'Grants', 'Awards', 'Tweets', 'Custom'].map((section, idx) => (
                    <div key={idx} className="bg-white border rounded-lg shadow hover:shadow-md p-4 flex flex-col items-center">
                      <div className="text-3xl mb-2">📄</div>
                      <p className="text-sm font-medium text-gray-700">{section}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {sectionVisible('posts') && (
            <div className="bg-white p-6 shadow rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-700">My SkillNest Posts</h3>
                <button className="text-sm text-blue-600 hover:underline">Change Title</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Below are posts that you have added to your public SkillNest profile.
              </p>
              <div className="border p-6 rounded-lg text-center text-gray-400 text-sm bg-gray-50">
                You haven't added any posts to your public SkillNest profile.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;