import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import {
  MessageSquare, Bookmark, Compass, Users, Heart,
  MessageCircle, UserPlus, Trash2, Edit, Send, TrendingUp,
} from "lucide-react";
import api from "../services/api";
import socket from "../socket";

const TABS = [
  { label: "Feed",        icon: <MessageSquare size={16} /> },
  { label: "Explore",     icon: <Compass size={16} /> },
  { label: "My Mentors",  icon: <Users size={16} /> },
  { label: "Saved Posts", icon: <Bookmark size={16} /> },
];

export default function Community() {
  const [posts, setPosts]           = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab]   = useState("Feed");
  const [newPost, setNewPost]       = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading]       = useState(true);

  const currentUser   = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id || currentUser?.id;

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 2500); };

  //  Fetch all posts 
  useEffect(() => {
    fetchPosts();
    fetchSavedPosts();
  }, []);

  // Socket — real time updates 
  useEffect(() => {
    socket.on("post:created", (post) => {
      setPosts((prev) => [post, ...prev]);
    });
    socket.on("post:updated", (post) => {
      setPosts((prev) => prev.map((p) => p._id === post._id ? post : p));
    });
    socket.on("post:deleted", ({ id }) => {
      setPosts((prev) => prev.filter((p) => p._id !== id));
    });
    socket.on("post:commented", ({ postId, comment }) => {
      setPosts((prev) => prev.map((p) =>
        p._id === postId ? { ...p, comments: [...p.comments, comment] } : p
      ));
    });
    socket.on("skill:added", (skill) => {
      setPosts((prev) => [{
        _id: Date.now(),
        title: "🆕 New Skill Added",
        description: skill.description || "A new skill was shared",
        likes: [], comments: [], saved: [],
        author: { name: "SkillSwap", avatar: "" },
      }, ...prev]);
    });
    return () => {
      socket.off("post:created");
      socket.off("post:updated");
      socket.off("post:deleted");
      socket.off("post:commented");
      socket.off("skill:added");
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.data || []);
    } catch (err) {
      console.error("fetchPosts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const res = await api.get("/posts/saved");
      setSavedPosts(res.data.data || []);
    } catch (err) {
      console.error("fetchSavedPosts error:", err);
    }
  };

  //  Create post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      await api.post("/posts", { title: newPost, description: newPost });
      setNewPost("");
      flash("Post published!");
    } catch (err) {
      console.error("createPost error:", err);
      flash("Failed to post. Try again.");
    }
  };

  // Like toggle
  const handleLike = async (id) => {
    try {
      const res = await api.put(`/posts/${id}/like`);
      setPosts((prev) => prev.map((p) => {
        if (p._id !== id) return p;
        const liked = res.data.liked;
        return {
          ...p,
          likes: liked
            ? [...p.likes, currentUserId]
            : p.likes.filter((l) => String(l) !== String(currentUserId)),
        };
      }));
    } catch (err) {
      console.error("likePost error:", err);
    }
  };

  // Save toggle 
  const handleSavePost = async (post) => {
    try {
      const res = await api.put(`/posts/${post._id}/save`);
      flash(res.data.saved ? "Post saved!" : "Post unsaved");
      fetchSavedPosts();
    } catch (err) {
      console.error("savePost error:", err);
    }
  };

  // Add comment 
  const handleAddComment = async (id, text) => {
    if (!text.trim()) return;
    try {
      await api.post(`/posts/${id}/comment`, { text });
    } catch (err) {
      console.error("addComment error:", err);
    }
  };

  //  Delete post 
  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      flash("Post deleted");
    } catch (err) {
      console.error("deletePost error:", err);
    }
  };

  //  Edit post 
  const handleEdit = async (id, text) => {
    try {
      await api.put(`/posts/${id}`, { title: text, description: text });
      flash("Post updated!");
    } catch (err) {
      console.error("updatePost error:", err);
    }
  };

  const renderContent = () => {
    if (loading) return <EmptyState text="Loading community…" />;

    if (activeTab === "Saved Posts") {
      return savedPosts.length
        ? savedPosts.map((post) => (
            <PostCard key={post._id} post={post}
              currentUserId={currentUserId}
              onLike={handleLike} onSave={handleSavePost}
              onComment={handleAddComment} onDelete={handleDelete} onEdit={handleEdit}
            />
          ))
        : <EmptyState text="No saved posts yet" />;
    }

    if (activeTab === "My Mentors") {
      return (
        <div className="grid gap-4">
          <MentorCard name="Alex Rivera"  role="AI Specialist"    avatar="A" />
          <MentorCard name="Rahul Verma"  role="Full Stack Mentor" avatar="R" />
        </div>
      );
    }

    return (
      <>
        <CreatePost
          newPost={newPost}
          setNewPost={setNewPost}
          onPost={handleCreatePost}
          currentUser={currentUser}
        />
        {posts.map((post) => (
          <PostCard key={post._id} post={post}
            currentUserId={currentUserId}
            onLike={handleLike} onSave={handleSavePost}
            onComment={handleAddComment} onDelete={handleDelete} onEdit={handleEdit}
          />
        ))}
        {posts.length === 0 && <EmptyState text="No posts yet — be the first!" />}
      </>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-12 gap-6">

          {/* ── Left sidebar ── */}
          <aside className="col-span-3 space-y-1">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">Menu</p>
              {TABS.map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    activeTab === label
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-sm mt-4">
              <p className="text-xs opacity-75 mb-1">Community</p>
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-xs opacity-75">posts shared</p>
            </div>
          </aside>

          {/* ── Main feed ── */}
          <main className="col-span-6 space-y-4">
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                ✓ {successMsg}
              </div>
            )}
            {renderContent()}
          </main>

          {/* ── Right sidebar ── */}
          <aside className="col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-indigo-500" />
                <h3 className="font-semibold text-sm">Trending Topics</h3>
              </div>
              {[
                { tag: "#React",     count: "1.2k" },
                { tag: "#Python",    count: "890" },
                { tag: "#AI",        count: "620" },
                { tag: "#WebDesign", count: "410" },
              ].map(({ tag, count }) => (
                <div key={tag} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-indigo-600 font-medium">{tag}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-indigo-500" />
                <h3 className="font-semibold text-sm">Top Mentors</h3>
              </div>
              {["Alex Rivera", "Priya Sharma", "Rahul Verma"].map((name) => (
                <div key={name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                      {name[0]}
                    </div>
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                  <button className="text-indigo-500 hover:text-indigo-700 transition">
                    <UserPlus size={15} />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/*  UI Components  */

const CreatePost = ({ newPost, setNewPost, onPost, currentUser }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
        {currentUser?.name?.[0]?.toUpperCase() || "U"}
      </div>
      <div className="flex-1">
        <input
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onPost()}
          placeholder="Share something with the community…"
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 border-b border-gray-100 pb-2 mb-3"
        />
        <div className="flex justify-end">
          <button
            onClick={onPost}
            disabled={!newPost.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm px-5 py-2 rounded-full transition"
          >
            <Send size={14} /> Post
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PostCard = ({ post, currentUserId, onLike, onSave, onComment, onDelete, onEdit }) => {
  const [commentText, setCommentText]   = useState("");
  const [editing, setEditing]           = useState(false);
  const [editText, setEditText]         = useState(post.title);
  const [showComments, setShowComments] = useState(false);
  const inputRef = useRef(null);

  const isLiked   = post.likes?.map(String).includes(String(currentUserId));
  const isSaved   = post.saved?.map(String).includes(String(currentUserId));
  const isAuthor  = String(post.author?._id) === String(currentUserId);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {post.author?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{post.author?.name || "User"}</p>
            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        {/* Edit / Delete — author மட்டும் பாக்கலாம் */}
        {isAuthor && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="text-gray-400 hover:text-indigo-500 transition">
              <Edit size={15} />
            </button>
            <button onClick={() => onDelete(post._id)} className="text-gray-400 hover:text-red-500 transition">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          onKeyDown={(e) => {
            if (e.key === "Enter") { onEdit(post._id, editText); setEditing(false); }
          }}
        />
      ) : (
        <div>
          <p className="font-semibold text-gray-800">{post.title}</p>
          {post.description !== post.title && (
            <p className="text-sm text-gray-500 mt-1">{post.description}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm transition ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => { setShowComments(!showComments); setTimeout(() => inputRef.current?.focus(), 100); }}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500 transition"
        >
          <MessageCircle size={16} />
          <span>{post.comments?.length || 0}</span>
        </button>

        <button
          onClick={() => onSave(post)}
          className={`ml-auto transition ${isSaved ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
        >
          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="space-y-2">
          {post.comments?.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {c.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="text-sm bg-gray-50 text-gray-700 px-3 py-2 rounded-xl flex-1">
                <span className="font-medium text-xs text-gray-500">{c.user?.name} · </span>
                {c.text}
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <input
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") { onComment(post._id, commentText); setCommentText(""); }
              }}
            />
            <button
              onClick={() => { onComment(post._id, commentText); setCommentText(""); }}
              className="text-indigo-500 hover:text-indigo-700 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MentorCard = ({ name, role, avatar }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
      {avatar}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
    <button className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition">
      Follow
    </button>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <MessageSquare size={40} className="mb-3 opacity-30" />
    <p className="text-sm">{text}</p>
  </div>
);