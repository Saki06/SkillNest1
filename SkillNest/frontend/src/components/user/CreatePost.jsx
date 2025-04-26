import React, { useEffect, useState } from "react";
import UserAvatar from "../user/UserAvatar";
import {
  FileText,
  PieChart,
  Calendar,
  ChevronDown,
  Image,
  Video,
  X,
  Youtube,
  Video as VideoIcon,
  Film,
  Cloud,
  File,
  HardDrive,
  Box as BoxIcon,
  Image as GoogleImage,
} from "lucide-react";
import API from "../../api/axios";
import { toast } from "react-toastify";

const CreatePost = ({ avatarInitials }) => {
  const [initials, setInitials] = useState(avatarInitials || "SN");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [postVisibility, setPostVisibility] = useState("");
  const [addToPortfolio, setAddToPortfolio] = useState(false);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (user?.name) {
      const names = user.name.trim().split(" ");
      const firstInitial = names[0]?.[0] || "";
      const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] : "";
      setInitials((firstInitial + lastInitial).toUpperCase());
      setUserId(user._id || user.id || "");
      setProfileImage(user.profileImage || "");
    }

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handlePostClick = () => setShowPostForm(true);

  const handleCancel = () => {
    setShowPostForm(false);
    setPostTitle("");
    setPostContent("");
    setSelectedFiles([]);
    setPostVisibility("");
    setAddToPortfolio(false);
    setError("");
  };

  const handleFileChange = (e, fileType) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (fileType === "photo") return file.type.startsWith("image/");
      if (fileType === "video") return file.type.startsWith("video/");
      if (fileType === "pdf") return file.type === "application/pdf";
      return false;
    });
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setShowImageModal(false);
    setShowVideoModal(false);
    setShowFileModal(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => file.type === "application/pdf");
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setShowFileModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!postVisibility) {
      setError("Please select a post visibility option.");
      return;
    }

    if (!userId || !token) {
      setError("User authentication details are missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("content", postContent);
    formData.append("visibility", postVisibility);
    formData.append("addToPortfolio", addToPortfolio);
    formData.append("userId", userId);
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await API.post("/auth/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Post submitted successfully");
        handleCancel();
      } else {
        throw new Error("Post submission failed");
      }
    } catch (err) {
      setError(
        "Error submitting post: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm w-full max-w-5xl mx-auto">
      {!showPostForm ? (
        <>
          <div className="flex items-center gap-2 mb-4 flex-col sm:flex-row">
            <UserAvatar
              initials={initials}
              profileImage={profileImage}
              border="blue"
            />
            <input
              type="text"
              placeholder="Share a post with your Networks or interest communities. You can also use # or @"
              className="w-full p-3 rounded-full bg-gray-100 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex border-t pt-2 flex-wrap gap-2">
            <button
              onClick={handlePostClick}
              className="flex items-center gap-2 text-blue-600 px-4 py-1 rounded-md hover:bg-blue-50 flex-1 justify-center min-w-[120px]"
            >
              <FileText size={18} />
              <span>Post</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-orange-600 px-4 py-1 rounded-md hover:bg-orange-50 flex-1 justify-center min-w-[120px]"
            >
              <PieChart size={18} />
              <span>Poll</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-yellow-600 px-4 py-1 rounded-md hover:bg-yellow-50 flex-1 justify-center min-w-[120px]"
            >
              <Calendar size={18} />
              <span>Event</span>
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex border-b pb-2 mb-4 flex-wrap gap-2">
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 px-4 py-1 rounded-md bg-blue-50 flex-1 justify-center min-w-[120px]"
            >
              <FileText size={18} />
              <span>Post</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-orange-600 px-4 py-1 rounded-md hover:bg-orange-50 flex-1 justify-center min-w-[120px]"
            >
              <PieChart size={18} />
              <span>Poll</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-yellow-600 px-4 py-1 rounded-md hover:bg-yellow-50 flex-1 justify-center min-w-[120px]"
            >
              <Calendar size={18} />
              <span>Event</span>
            </button>
          </div>
          <p className="text-gray-700 mb-2">Post Title</p>
          <input
            type="text"
            placeholder="Post Title"
            className="w-full p-2 mb-4 border rounded-md text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Share a post with your Networks or interest communities. You can also use # or @"
            className="w-full p-3 mb-4 h-32 border rounded-md bg-gray-100 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            required
          />
          {selectedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center relative">
                      <VideoIcon size={24} className="text-gray-500" />
                      <span className="absolute bottom-1 left-1 text-xs text-gray-700 truncate w-16">
                        {file.name}
                      </span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center relative">
                      <FileText size={24} className="text-gray-500" />
                      <span className="absolute bottom-1 left-1 text-xs text-gray-700 truncate w-16">
                        {file.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                title="Add Photos"
                onClick={() => setShowImageModal(true)}
              >
                <Image className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                title="Add Video"
                onClick={() => setShowVideoModal(true)}
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                title="Add PDF"
                onClick={() => setShowFileModal(true)}
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              title="More Options"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          {showImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add an Image</h3>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <Image size={20} className="text-blue-500" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "photo")}
                    />
                  </label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-100 cursor-not-allowed">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                      />
                    </svg>
                    <span className="text-gray-500">Draw Image</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showVideoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add a Video</h3>
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-100 cursor-not-allowed">
                    <VideoIcon size={20} className="text-red-500" />
                    <span className="text-gray-500">
                      Record a video with device camera
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-100 cursor-not-allowed">
                    <Youtube size={20} className="text-red-500" />
                    <span className="text-gray-500">YouTube video</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-100 cursor-not-allowed">
                    <Film size={20} className="text-blue-500" />
                    <span className="text-gray-500">Vimeo video</span>
                  </div>
                  <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <Video size={20} className="text-blue-500" />
                    <span>
                      Upload a Video File{" "}
                      <span className="text-gray-500 text-sm">
                        (.mp4 preferred)
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "video")}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          {showFileModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    My CN File Repository
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowFileModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 border-r pr-4 mb-4 md:mb-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <Cloud size={20} className="text-blue-500" />
                        <span className="font-semibold">Local Files</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 text-gray-500 cursor-not-allowed">
                        <File size={20} />
                        <span>My Uploaded Files</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 text-gray-500 cursor-not-allowed">
                        <HardDrive size={20} />
                        <span>Assignment Files</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 text-gray-500 cursor-not-allowed">
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        <span>Dropbox</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 text-gray-500 cursor-not-allowed">
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M4.5 4.5c0-1.38 1.12-2.5 2.5-2.5h10c1.38 0 2.5 1.12 2.5 2.5v15c0 1.38-1.12 2.5-2.5 2.5h-10c-1.38 0-2.5-1.12-2.5-2.5v-15zm5 0v6h4l-5 5-5-5h4v-6h2zm9 11v2h-12v-2h12z" />
                        </svg>
                        <span>OneDrive</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 text-gray-500 cursor-not-allowed">
                        <BoxIcon size={20} />
                        <span>Box</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 text-gray-500 cursor-not-allowed">
                        <GoogleImage size={20} />
                        <span>Google Image</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 pl-0 md:pl-4">
                    <div
                      className={`border-2 border-dashed rounded-md p-6 text-center ${
                        dragging
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Cloud size={24} className="mx-auto text-blue-500 mb-2" />
                      <p className="text-gray-700">
                        Drag file to upload or{" "}
                        <label className="text-blue-500 cursor-pointer hover:underline">
                          <span>browse</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "pdf")}
                          />
                        </label>
                      </p>
                      <a
                        href="#"
                        className="text-blue-500 text-sm hover:underline"
                      >
                        Learn about Upload Files to SN
                      </a>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowFileModal(false)}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFileModal(false)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Add Files
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <ChevronDown size={18} />
              <span>Post Settings</span>
            </div>
            <div className="mt-2">
              <label className="block text-sm text-gray-700">
                Post Visibility <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2 mt-1 border rounded-md text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={postVisibility}
                onChange={(e) => setPostVisibility(e.target.value)}
                required
              >
                <option value="">Please select at least one</option>
                <option value="public">Public</option>
                <option value="network">Network Only</option>
                <option value="private">Private</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Note: You must visit a course to make a post in it
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="portfolio"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={addToPortfolio}
                onChange={(e) => setAddToPortfolio(e.target.checked)}
              />
              <label htmlFor="portfolio" className="text-sm text-gray-700">
                Add to my SkillNest ePortfolio
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit Post
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
