import React, { useState, useEffect, memo } from "react";
import {
  Star,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Bookmark,
} from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { motion } from "framer-motion";

const Post = ({
  user,
  post,
  isFollowing,
  updateFollowingState,
  refreshFollowing,
  onPostUpdated,
  onPostDeleted,
}) => {
  const {
    user: postUser = {},
    createdAt,
    title,
    content,
    mediaUrls = [],
    likeCount = 0,
    commentCount = 0,
    likedBy = [],
  } = post;
  const [showOptions, setShowOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(likedBy.includes(user?.id));
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [currentCommentCount, setCurrentCommentCount] = useState(commentCount);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isUserFollowing, setIsUserFollowing] = useState(isFollowing);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwnPost = user?.id === (postUser?.id || postUser?._id);

  useEffect(() => {
    setIsUserFollowing(isFollowing);
  }, [isFollowing]);

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments, post.id]);

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/auth/posts/${post.id}/comments`);
      setComments(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load comments");
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please log in to like posts");

      if (isLiked) {
        await API.post(`/auth/posts/${post.id}/unlike?userId=${user.id}`);
        setIsLiked(false);
        setCurrentLikeCount((prev) => prev - 1);
      } else {
        await API.post(`/auth/posts/${post.id}/like?userId=${user.id}`);
        setIsLiked(true);
        setCurrentLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to like/unlike post");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return toast.error("Comment cannot be empty");

    try {
      const { data } = await API.post(
        `/auth/posts/${post.id}/comment?userId=${
          user.id
        }&content=${encodeURIComponent(commentInput)}`
      );
      setComments((prev) => [data, ...prev]);
      setCommentInput("");
      setCurrentCommentCount((prev) => prev + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleEditCommentSubmit = async (e, commentId) => {
    e.preventDefault();
    if (!editCommentContent.trim())
      return toast.error("Comment cannot be empty");

    try {
      const { data } = await API.post(
        `/auth/posts/comment/${commentId}/edit?userId=${
          user.id
        }&content=${encodeURIComponent(editCommentContent)}`
      );
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: data.content } : c
        )
      );
      setEditingCommentId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await API.delete(`/auth/posts/comment/${commentId}?userId=${user.id}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCurrentCommentCount((prev) => prev - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please log in to delete posts");

      await API.delete(`/auth/posts/${post.id}`);
      toast.success("Post deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    } finally {
      setShowOptions(false);
    }
  };

  const handleFollow = async (e, userIdToFollow) => {
    e.preventDefault();
    if (!userIdToFollow || !localStorage.getItem("token") || isFollowLoading) {
      toast.error(
        !userIdToFollow ? "Invalid user ID" : "Please log in to follow users"
      );
      return;
    }

    setIsFollowLoading(true);
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    };
    const payload = isUserFollowing
      ? { userIdToUnfollow: userIdToFollow }
      : { userIdToFollow };

    try {
      const { data, status } = await API.post(
        isUserFollowing ? "/auth/unfollow" : "/auth/follow",
        payload,
        config
      );
      if (status === 200) {
        setIsUserFollowing(!isUserFollowing);
        updateFollowingState(userIdToFollow, !isUserFollowing);
        if (data.following) {
          setFollowing(new Set(data.following));
        } else {
          await refreshFollowing();
        }
        toast.success(
          isUserFollowing ? "Unfollowed successfully" : "Followed successfully"
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to follow/unfollow user"
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  const getFileExtension = (filename) =>
    filename?.split(".").pop()?.toLowerCase() || "";

  const getFileName = (url) => {
    if (!url) return "Untitled Document";
    const parts = url.split("/");
    return parts[parts.length - 1].split("?")[0] || "Untitled Document";
  };

  const renderMedia = (url, idx, options = {}) => {
    const { isGrid = false, isPrimary = false } = options;
    if (!url) return null;
    const ext = getFileExtension(url);

    // Prepend base URL to relative paths
    const baseUrl = "http://localhost:8000";
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    // Animation variants for subtle hover effect
    const cardVariants = {
      rest: { scale: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" },
      hover: {
        scale: 1.02,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.2, ease: "easeOut" },
      },
    };

    return (
      <motion.div
        key={fullUrl}
        className={`w-full rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${
          isGrid ? "h-full" : ""
        }`}
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
      >
        {ext === "pdf" ? (
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label={`View ${getFileName(url)} in a new tab`}
          >
            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
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
            <div className="ml-4 flex-1">
              <span className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                {getFileName(url)}
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                Open File
              </span>
            </div>
          </a>
        ) : ["jpg", "jpeg", "png", "gif"].includes(ext) ? (
          <img
            src={fullUrl}
            alt={`Post media ${idx + 1}`}
            className="w-full h-auto object-contain rounded-lg"
            style={{
              aspectRatio: "16 / 9",
              maxHeight: isPrimary ? "500px" : isGrid ? "200px" : "400px",
            }}
            onError={(e) => (e.target.src = "/assets/fallback-image.png")}
          />
        ) : ["mp4", "webm", "mov"].includes(ext) ? (
          <video
            src={fullUrl}
            controls
            className="w-full h-auto object-contain rounded-lg"
            style={{
              aspectRatio: "16 / 9",
              maxHeight: isPrimary ? "500px" : isGrid ? "200px" : "400px",
            }}
            onError={() => console.error(`Failed to load video from ${fullUrl}`)}
          />
        ) : (
          <div className="flex items-center justify-center h-64 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Unsupported file
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  // Separate images/videos from PDFs
  const visualMediaUrls = mediaUrls.filter((url) =>
    ["jpg", "jpeg", "png", "gif", "mp4", "webm", "mov"].includes(
      getFileExtension(url)
    )
  );
  const pdfUrls = mediaUrls.filter((url) => getFileExtension(url) === "pdf");

  return (
    <article className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden max-w-5xl mx-auto">
      <header className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <img
              src={postUser.profileImage || "/assets/avatar.png"}
              alt={`${postUser.name || "User"} profile`}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  {postUser.name || "Unknown User"}
                </span>
                {postUser.country && (
                  <img
                    src={`/flags/${postUser.country}.png`}
                    alt={`${postUser.country} flag`}
                    className="w-5 h-3"
                  />
                )}
                {postUser.isMember && (
                  <span className="text-gray-500 text-xs bg-blue-100 px-2 py-1 rounded-full">
                    SN Member
                  </span>
                )}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                @{postUser.username || "username"} ·{" "}
                {new Date(createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isOwnPost && (
              <button
                onClick={(e) => handleFollow(e, postUser._id || postUser.id)}
                disabled={isFollowLoading}
                className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                  isUserFollowing
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={isUserFollowing ? "Unfollow user" : "Follow user"}
              >
                {isFollowLoading
                  ? "Processing..."
                  : isUserFollowing
                  ? "Following"
                  : "Follow"}
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                aria-label="More options"
              >
                <MoreHorizontal size={20} />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowOptions(false)}
                  >
                    Report
                  </button>
                  {isOwnPost && (
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={handleDeletePost}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <section className="p-4">
        {(title || content) && (
          <div className="mb-4">
            {title && (
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {title}
              </h3>
            )}
            {content && (
              <div>
                <p
                  className={`text-gray-600 whitespace-pre-line text-base ${
                    isExpanded ? "" : "line-clamp-4"
                  }`}
                  onClick={() => setIsExpanded(true)}
                >
                  {content}
                </p>
                {content.length > 200 && !isExpanded && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-blue-600 hover:underline text-sm mt-2"
                  >
                    Read More
                  </button>
                )}
                {isExpanded && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-blue-600 hover:underline text-sm mt-2"
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {mediaUrls.length > 0 && (
          <div className="mt-4 space-y-4">
            {visualMediaUrls.length > 0 && (
              <>
                {/* First image/video (full-width) */}
                {renderMedia(visualMediaUrls[0], 0, { isPrimary: true })}
                {/* Additional images/videos (grid) */}
                {visualMediaUrls.length > 1 && (
                  <div
                    className={`grid gap-4 ${
                      visualMediaUrls.length === 2
                        ? "grid-cols-1 md:grid-cols-2"
                        : "grid-cols-1 md:grid-cols-2"
                    }`}
                  >
                    {visualMediaUrls.slice(1).map((url, idx) =>
                      renderMedia(url, idx + 1, { isGrid: true })
                    )}
                  </div>
                )}
              </>
            )}
            {/* PDFs */}
            {pdfUrls.map((url, idx) => renderMedia(url, idx))}
          </div>
        )}
      </section>
      <section className="flex justify-between items-center border-t border-gray-100 px-4 py-3">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          <Star
            size={18}
            className={`${
              isLiked ? "fill-blue-600 text-blue-600" : "text-gray-400"
            } hover:fill-blue-600`}
          />
          <span className="text-sm">{currentLikeCount} Likes</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
          aria-label="Toggle comments"
        >
          <MessageSquare size={18} className="text-gray-400" />
          <span className="text-sm">{currentCommentCount} Comments</span>
        </button>
        <button
          className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
          onClick={() => toast.success("Post saved!")}
          aria-label="Save post"
        >
          <Bookmark size={18} className="text-gray-400 hover:fill-blue-600" />
          <span className="text-sm">Save</span>
        </button>
      </section>
      {showComments && (
        <section className="border-t border-gray-100 px-4 py-3">
          <div className="mb-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 mb-3">
                  <img
                    src={comment.user?.profileImage || "/assets/avatar.png"}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-sm text-gray-800">
                          {comment.user?.name || "Unknown User"}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {comment.userId === user.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditCommentContent(comment.content);
                            }}
                            className="text-sm text-blue-500 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <form
                        onSubmit={(e) => handleEditCommentSubmit(e, comment.id)}
                        className="flex items-center gap-2 mt-2"
                      >
                        <input
                          value={editCommentContent}
                          onChange={(e) =>
                            setEditCommentContent(e.target.value)
                          }
                          className="flex-1 text-sm p-1 border border-gray-300 rounded"
                        />
                        <button type="submit" className="text-sm text-blue-600">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="text-sm text-gray-500"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <p className="text-gray-600 text-sm mt-1">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            )}
          </div>
        </section>
      )}
      <section className="border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <img
          src={user.profileImage || "/assets/avatar.png"}
          alt={`${user.name || "User"} profile`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <form
          onSubmit={handleCommentSubmit}
          className="flex-1 flex items-center"
        >
          <input
            type="text"
            placeholder="Add a reflection..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Add a comment"
          />
          <button
            type="submit"
            className="ml-2 text-blue-600 hover:text-blue-800"
            aria-label="Submit comment"
          >
            Post
          </button>
        </form>
      </section>
      <section className="border-t border-gray-100 px-4 py-3">
        <button
          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full"
          aria-label="Endorse post"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Endorse</span>
        </button>
      </section>
    </article>
  );
};

export default memo(Post);