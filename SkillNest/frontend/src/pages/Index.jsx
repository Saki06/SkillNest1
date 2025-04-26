import React, { useEffect, useState, useCallback } from "react";
import Navigation from "../components/user/Navigation";
import UserProfile from "../components/user/UserProfile";
import CreatePost from "../components/user/CreatePost";
import NetworksFilter from "../components/user/NetworksFilter";
import FeedSettings from "../components/user/FeedSettings";
import Post from "../components/user/Post";
import CourseMenu from "../components/user/CourseMenu";
import Footer from "../components/user/Footer";
import API from "../api/axios";
import { toast } from "react-toastify";

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 10;

  const getUserId = (userObj) =>
    userObj?._id ||
    userObj?.id ||
    (typeof userObj === "string" ? userObj : null);

  const fetchInitialData = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");

      if (!savedUser || !token) {
        toast.error("User not authenticated");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const userId = savedUser._id || savedUser.id;

      const [userRes, followingRes] = await Promise.all([
        API.get(`/auth/users/${userId}`, config),
        API.get(`/auth/following/${userId}`, config),
      ]);

      setUser({
        id: userRes.data._id || userRes.data.id,
        name: userRes.data.name || "Unknown User",
        username: userRes.data.username || "username",
        profileImage: userRes.data.profileImage || null,
        points: userRes.data.points || 0,
        country: userRes.data.country || null,
        isMember: userRes.data.isMember || false,
      });

      setFollowing(
        new Set((followingRes.data || []).filter(Boolean).map(getUserId))
      );

      await fetchPosts(1);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (pageNum) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await API.get(
        `/auth/posts?page=${pageNum}&limit=${postsPerPage}`,
        config
      );

      setPosts((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === postsPerPage);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load posts");
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = user?.id;
      if (!token || !userId) return;

      const { data } = await API.get(`/auth/following/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFollowing(new Set((data || []).filter(Boolean).map(getUserId)));
    } catch (err) {
      console.error("Error fetching following list:", err);
      toast.error("Failed to load following list");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handlePostCreated = useCallback((newPost) => {
    setPosts((prev) => {
      // Prevent duplicates by checking post ID
      if (
        prev.some(
          (post) => (post._id || post.id) === (newPost._id || newPost.id)
        )
      ) {
        return prev;
      }
      return [newPost, ...prev];
    });
  }, []);

  const handleFollowToggle = useCallback((userId, follow) => {
    setFollowing((prev) => {
      const updated = new Set(prev);
      follow ? updated.add(userId) : updated.delete(userId);
      return updated;
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      hasMore &&
      !loading
    ) {
      setLoading(true);
      fetchPosts(page + 1);
    }
  }, [hasMore, loading, page]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const renderSkeleton = () => (
    <div className="space-y-6">
      {Array(5)
        .fill()
        .map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-1" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {user ? (
              <UserProfile
                name={user.name}
                username={`@${user.username}`}
                points={user.points}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            )}
            <CourseMenu />
            <Footer />
          </div>
          <div className="lg:col-span-3 space-y-4">
            {user ? (
              <CreatePost
                avatarInitials={user.name?.[0] || "U"}
                onPostCreated={handlePostCreated}
                user={user}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            )}
            <FeedSettings />
            <NetworksFilter />
            <div className="space-y-6">
              {loading && page === 1 ? (
                renderSkeleton()
              ) : posts.length > 0 ? (
                posts.map((post) => {
                  const postUserId = getUserId(post.user);
                  return (
                    <Post
                      key={post._id || post.id}
                      user={user}
                      post={post}
                      isFollowing={following.has(postUserId)}
                      updateFollowingState={handleFollowToggle}
                      refreshFollowing={fetchFollowing}
                    />
                  );
                })
              ) : (
                <p className="text-center text-gray-600">No posts available</p>
              )}
              {loading && page > 1 && (
                <p className="text-center text-gray-600">
                  Loading more posts...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Index);
