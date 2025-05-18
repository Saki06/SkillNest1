
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import API from "../../api/axios";
import Navigation from "../user/Navigation";

// Placeholder ExternalLink icon (replace with lucide-react or similar)
const ExternalLink = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

// API utility functions
const fetchUserData = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    const response = await API.get(`/auth/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data) throw new Error("No user data returned");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};

const fetchSkills = async (userId, token) => {
  try {
    const response = await API.get(`/auth/users/${userId}/skills`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    throw error;
  }
};

// AboutSection component (redesigned)
const AboutSection = ({ user }) => {
  const form = user || {};

  const infoItems = [
    { label: "Email", value: form.email, icon: <ExternalLink size={16} className="text-gray-500" /> },
    { label: "Location", value: form.city || form.state || form.country, icon: <ExternalLink size={16} className="text-gray-500" /> },
    { label: "Language", value: form.language, icon: <ExternalLink size={16} className="text-gray-500" /> },
    { label: "Gender", value: form.gender, icon: <ExternalLink size={16} className="text-gray-500" /> },
    { label: "Institution", value: form.institution, icon: <ExternalLink size={16} className="text-gray-500" /> },
    { label: "Role", value: form.role, icon: <ExternalLink size={16} className="text-gray-500" /> },
    { label: "Field of Study", value: form.fieldOfStudy, icon: <ExternalLink size={16} className="text-gray-500" /> },
  ].filter(item => item.value); // Only show items with values

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">About</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bio</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {form.bio || <span className="text-gray-400">No bio added yet</span>}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tagline</h3>
            <p className="text-gray-600">
              {form.tagline || <span className="text-gray-400">No tagline added yet</span>}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Resume</h3>
            {form.resume ? (
              <a
                href={`http://localhost:8000/uploads/${encodeURIComponent(
                  form.resume.replace(/^\/?uploads\//, "")
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="View current resume"
              >
                View Resume
                <ExternalLink size={14} className="ml-2" />
              </a>
            ) : (
              <p className="text-gray-400">No resume uploaded yet</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Details</h3>
            <div className="space-y-2">
              {infoItems.length > 0 ? (
                infoItems.map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    {icon}
                    <span className="text-gray-600">
                      <span className="font-medium">{label}:</span> {value}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No details provided</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Internship/Tutoring</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {form.internship || <span className="text-gray-400">No information provided</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// SkillsSection component
const SkillsSection = ({ userId }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!userId || !token) {
      setError("Invalid user ID or no authentication token");
      setLoading(false);
      return;
    }

    const loadSkills = async () => {
      setLoading(true);
      try {
        const skillsData = await fetchSkills(userId, token);
        setSkills(skillsData);
      } catch (err) {
        setError("Failed to load skills");
        toast.error("Failed to load skills");
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 bg-white rounded-lg shadow-sm">
        Loading skills...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-white rounded-lg shadow-sm">{error}</div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills</h2>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg font-semibold text-gray-700">
          {skills.length} {skills.length === 1 ? "skill" : "skills"}
        </span>
        <span className="text-lg font-semibold text-gray-500">
          0 skills with evidence 📄
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span
              key={skill}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              #{skill}
            </span>
          ))
        ) : (
          <p className="text-gray-500">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

// DocumentsSection component
const DocumentsSection = ({ userId }) => {
  const [documents, setDocuments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async (uid) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await API.get(`/auth/users/${uid}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments([...res.data].reverse());
    } catch (err) {
      setError(`Failed to fetch documents: ${err.message}`);
      toast.error(`Failed to fetch documents: ${err.message}`);
      console.error("Fetch documents error:", err);
    }
  };

  const fetchImage = async (fileUrl) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await API.get(fileUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } catch (err) {
      console.error("Failed to fetch image:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    const loadDocuments = async () => {
      setLoading(true);
      await fetchDocuments(userId);
      setLoading(false);
    };

    loadDocuments();
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const urls = {};
      for (const doc of documents) {
        if (doc.filePath?.match(/\.(jpeg|jpg|png|pdf)$/i)) {
          const imageUrl = await fetchImage(doc.filePath);
          if (imageUrl && isMounted) {
            urls[doc.id] = imageUrl;
          }
        }
      }
      if (isMounted) {
        setImageUrls(urls);
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [documents]);

  const getVisibilityIcon = (vis) => {
    switch (vis) {
      case "public":
        return "🌐";
      case "hidden":
        return "🔗";
      default:
        return "🔒";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Unknown Date"
      : date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 bg-white rounded-lg shadow-sm">
        Loading documents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-white rounded-lg shadow-sm">{error}</div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Documents & Certificates</h2>
      <div className="space-y-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <motion.div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 flex gap-4 items-start hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {doc.filePath?.match(/\.(jpeg|jpg|png|pdf)$/i) && imageUrls[doc.id] ? (
                <a
                  href={`http://localhost:8000${doc.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <img
                    src={imageUrls[doc.id]}
                    alt={doc.name}
                    className="w-20 h-20 object-cover rounded border cursor-pointer"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </a>
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-100 text-gray-500 text-3xl rounded">
                  {doc.type === "certificate" ? "🎓" : "📄"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {doc.name} {getVisibilityIcon(doc.visibility)}
                  </h3>
                  {doc.folder && (
                    <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {doc.folder}
                    </span>
                  )}
                </div>
                {doc.type === "certificate" ? (
                  <>
                    <p className="text-gray-600 text-sm mt-1">
                      Issued by {doc.issuingOrganization}
                    </p>
                    {doc.credentialUrl && (
                      <a
                        href={doc.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline transition-colors"
                      >
                        View Credential
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600 text-sm mt-1 truncate">
                    {doc.description || "No description provided"}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Uploaded on {formatDate(doc.uploadedAt)}
                </p>
                {doc.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No documents or certificates added yet.</p>
        )}
      </div>
    </div>
  );
};

// ShowcasesSection component
const ShowcasesSection = ({ userId }) => {
  const [showcases, setShowcases] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState({});

  const fetchShowcases = async (uid) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await API.get(`/auth/users/${uid}/showcases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const showcasesData = [...res.data].reverse();
      setShowcases(showcasesData);
      setShowFullDescription(
        showcasesData.reduce(
          (acc, showcase) => ({ ...acc, [showcase.id]: false }),
          {}
        )
      );
    } catch (err) {
      setError(`Failed to fetch showcases: ${err.message}`);
      toast.error(`Failed to fetch showcases: ${err.message}`);
      console.error("Fetch showcases error:", err);
    }
  };

  const fetchImage = async (filePath) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const fileName = filePath.split("/").pop();
      const url = `/auth/users/${userId}/showcases/view/${fileName}`;
      const response = await API.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } catch (err) {
      console.error("Failed to fetch image:", err);
      return "/placeholder.png";
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    const loadShowcases = async () => {
      setLoading(true);
      await fetchShowcases(userId);
      setLoading(false);
    };

    loadShowcases();
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const urls = {};
      for (const showcase of showcases) {
        if (showcase.filePath?.match(/\.(jpeg|jpg|png)$/i)) {
          const imageUrl = await fetchImage(showcase.filePath);
          if (isMounted) {
            urls[showcase.id] = imageUrl;
          }
        }
      }
      if (isMounted) {
        setImageUrls((prev) => ({ ...prev, ...urls }));
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [showcases, userId]);

  const getVisibilityIcon = (vis) => {
    switch (vis) {
      case "public":
        return "🌐 Public";
      case "hidden":
        return "🔗 Link only";
      default:
        return "🔒 Private";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Unknown Date"
      : date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  const toggleDescription = (showcaseId) => {
    setShowFullDescription((prev) => ({
      ...prev,
      [showcaseId]: !prev[showcaseId],
    }));
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 bg-white rounded-lg shadow-sm">
        Loading showcases...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-white rounded-lg shadow-sm">{error}</div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects</h2>
      <p className="text-sm text-gray-600 mb-6">
        Showcase your projects to highlight your skills and experience
      </p>
      <div className="space-y-6">
        {showcases.length > 0 ? (
          showcases.map((showcase) => (
            <motion.div
              key={showcase.id}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showcase.filePath?.match(/\.(jpeg|jpg|png)$/i) && imageUrls[showcase.id] ? (
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={imageUrls[showcase.id]}
                    alt={showcase.title}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>
              ) : showcase.filePath?.match(/\.pdf$/i) && imageUrls[showcase.id] ? (
                <div className="w-full h-48 flex items-center justify-center bg-gray-50">
                  <div className="text-center p-4">
                    <span className="text-4xl text-gray-400 block mb-2">📄</span>
                    <span className="text-sm text-gray-600 font-medium">PDF Document</span>
                  </div>
                </div>
              ) : showcase.projectUrl ? (
                <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <ExternalLink size={32} className="mx-auto text-blue-500 mb-2" />
                    <a
                      href={showcase.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Visit Project
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <span className="text-4xl block mb-2">📂</span>
                    <span className="text-sm font-medium">No media attached</span>
                  </div>
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{showcase.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>
                        {formatDate(showcase.createdAt)} -{" "}
                        {formatDate(showcase.updatedAt || showcase.createdAt)}
                      </span>
                      {showcase.associatedWith && (
                        <span className="ml-2 text-blue-600">{showcase.associatedWith}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getVisibilityIcon(showcase.visibility)}
                    </p>
                  </div>
                </div>
                {showcase.description && (
                  <div className="text-sm text-gray-600 mb-4">
                    {showFullDescription[showcase.id] ? (
                      <p style={{ whiteSpace: "pre-line" }}>{showcase.description}</p>
                    ) : (
                      <p style={{ whiteSpace: "pre-line" }}>
                        {showcase.description.length > 100
                          ? `${showcase.description.substring(0, 100)}...`
                          : showcase.description}
                      </p>
                    )}
                    {showcase.description.length > 100 && (
                      <button
                        onClick={() => toggleDescription(showcase.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 transition-colors"
                      >
                        {showFullDescription[showcase.id] ? "See less" : "See more"}
                      </button>
                    )}
                  </div>
                )}
                {showcase.skills?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {showcase.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {showcase.projectUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={showcase.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center text-sm font-medium transition-colors"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Visit Project
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No projects added yet.</p>
        )}
      </div>
    </div>
  );
};

// PostsSection component
const PostsSection = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async (uid) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await API.get(`/auth/posts/user?userId=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      setError("Failed to load posts. Please try again later.");
      toast.error("Failed to load posts");
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserData(userId);
        setUser(userData);
        await fetchPosts(userId);
      } catch (err) {
        setError("Failed to load posts or user data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const BASE_URL = "http://localhost:8000";

  const getFileExtension = (filename) => {
    if (!filename) return "";
    const name = typeof filename === "string" ? filename : filename.name;
    return name.split(".").pop()?.toLowerCase() || "";
  };

  const getMediaUrl = (media) => {
    if (typeof media === "string") {
      return media.startsWith("http") ? media : `${BASE_URL}${media}`;
    }
    return URL.createObjectURL(media);
  };

  const renderMedia = (media, idx) => {
    const url = getMediaUrl(media);
    const ext = getFileExtension(media);

    const cardVariants = {
      rest: { scale: 1, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
      hover: {
        scale: 1.03,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.3, ease: "easeOut" },
      },
    };

    return (
      <motion.div
        key={idx}
        className="w-full rounded-xl overflow-hidden bg-white shadow-lg relative"
        style={{ aspectRatio: "4 / 3" }}
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
      >
        {ext === "pdf" ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="relative flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 transition-colors"
            aria-label="View PDF document in a new tab"
          >
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-xl" />
            <div className="relative z-10 mb-4">
              <svg
                className="w-12 h-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="relative z-10 text-lg font-semibold text-gray-800">
              PDF Document
            </span>
            <span className="relative z-10 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              Open File
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-200 to-blue-300" />
          </a>
        ) : ["jpg", "jpeg", "png", "gif"].includes(ext) ? (
          <img
            src={url}
            alt={`Post media ${idx + 1}`}
            className="w-full h-full object-cover object-center"
            onError={(e) => (e.target.src = "/assets/fallback-image.png")}
          />
        ) : ["mp4", "webm", "mov"].includes(ext) ? (
          <div className="relative flex flex-col items-center justify-center h-full p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 transition-colors">
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-xl" />
            <div className="relative z-10 w-full h-3/4">
              <video
                src={url}
                controls
                preload="metadata"
                className="w-full h-full object-cover object-center rounded-lg"
                aria-label="Play video content"
              />
            </div>
            <span className="relative z-10 mt-2 text-sm font-medium text-gray-800">
              Video Content
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-200 to-purple-300" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6 bg-gray-50">
            <span className="text-sm text-gray-500">Unsupported file</span>
          </div>
        )}
      </motion.div>
    );
  };

  const PostCard = ({ post, user }) => {
    return (
      <motion.div
        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-start">
          <img
            src={user.profileImage || "/assets/avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full mr-3 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/avatar.png";
            }}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{user.name || "SkillNest User"}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-medium text-gray-800 mb-2">{post.title}</h4>
          <p className="text-gray-600 mb-4">{post.content}</p>
          {post.mediaUrls?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {post.mediaUrls.map((media, idx) => renderMedia(media, idx))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 bg-white rounded-lg shadow-sm">
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-white rounded-lg shadow-sm">{error}</div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My SN Posts</h2>
      <p className="text-sm text-gray-600 mb-6">
        These are posts added to your public SN SkillNest.{" "}
        <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
          Learn more
        </a>
      </p>
      {posts.length === 0 ? (
        <div className="border border-gray-200 p-6 rounded-lg text-center text-gray-500 bg-gray-50">
          You haven't added any posts to your public SkillNest profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

// PublicProfilePage component
const PublicProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserData(userId);
        setUser(userData);
      } catch (err) {
        setError("Failed to load user profile");
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-red-600">{error || "User not found"}</p>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-6">
            <img
              src={user.profileImage || "/assets/avatar.png"}
              alt={`${user.name || "User"} profile`}
              className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{user.name || "Unknown User"}</h1>
              <p className="text-gray-600 text-sm">@{user.username || "username"}</p>
              {user.headline && <p className="text-gray-600 text-sm mt-1">{user.headline}</p>}
              {user.location && <p className="text-gray-500 text-sm mt-1">{user.location}</p>}
            </div>
          </div>
          {/* <div className="mt-6 flex gap-4">
            <Link
              to={`/profile/${userId}/message`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Message
            </Link>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => toast.info("Follow functionality coming soon!")}
              aria-label={`Follow ${user.name || "user"}`}
            >
              Follow
            </button>
          </div> */}
        </motion.div>

        {/* Profile Sections */}
        <AboutSection user={user} />
        <SkillsSection userId={userId} />
        <DocumentsSection userId={userId} />
        <ShowcasesSection userId={userId} />
        <PostsSection userId={userId} />

        <div className="text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
