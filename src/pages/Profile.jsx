import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { io } from "socket.io-client";
import { Sparkles } from "lucide-react";

const socket = io("http://localhost:5000");

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const bottomRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id || currentUser?.id;

  // fetch all users + conversations
  useEffect(() => {
    Promise.all([
      api.get("/users"),
      api.get("/messages"),
    ]).then(([usersRes, convRes]) => {
      setAllUsers(usersRes.data.data || []);
      setConversations(convRes.data.data || []);
    }).catch((err) => console.error("fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // fetch messages when user selected
  useEffect(() => {
    if (!selectedUser) return;
    setSuggestions([]);
    api.get(`/messages/${selectedUser._id}`)
      .then((res) => setMessages(res.data.data || []))
      .catch((err) => console.error("getConversation error:", err));
  }, [selectedUser]);

  // real time — receive messages via socket
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (
        selectedUser &&
        (String(msg.sender?._id) === String(selectedUser._id) ||
          String(msg.receiver?._id) === String(selectedUser._id))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("receive_message");
  }, [selectedUser]);

  // scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;
    try {
      const res = await api.post("/messages", {
        receiver: selectedUser._id,
        text: input,
      });
      setMessages((prev) => [...prev, res.data.data]);
      setInput("");
      setSuggestions([]);

      setConversations((prev) => {
        const exists = prev.find(
          (c) => String(c.user._id) === String(selectedUser._id)
        );
        if (exists) {
          return prev.map((c) =>
            String(c.user._id) === String(selectedUser._id)
              ? { ...c, lastMessage: input, lastTime: new Date() }
              : c
          );
        }
        return [
          { user: selectedUser, lastMessage: input, lastTime: new Date() },
          ...prev,
        ];
      });
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  };

  // AI suggestions 
  const fetchSuggestions = async () => {
    if (!selectedUser || messages.length === 0) return;
    setLoadingSuggestions(true);
    try {
      const context = messages
        .slice(-5)
        .map((m) => {
          const isMe =
            String(m.sender?._id) === String(currentUserId) ||
            String(m.sender) === String(currentUserId);
          return `${isMe ? "Me" : selectedUser.name}: ${m.text}`;
        })
        .join("\n");

      const res = await api.post("/messages/suggest", { context });
      setSuggestions(res.data.data || []);
    } catch (e) {
      console.error("fetchSuggestions error:", e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // conversations + all users merged
  const conversationUserIds = new Set(
    conversations.map((c) => String(c.user._id))
  );
  const otherUsers = allUsers
    .filter((u) => String(u._id) !== String(currentUserId))
    .filter((u) => !conversationUserIds.has(String(u._id)));

  const displayList = [
    ...conversations.map((c) => ({ ...c.user, lastMessage: c.lastMessage })),
    ...otherUsers,
  ].filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-72px)] bg-gray-50">

        {/* LEFT PANEL */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Messages</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users"
              className="w-full px-3 py-2 text-sm border rounded-lg"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <p className="p-4 text-sm text-gray-400">Loading...</p>
            )}
            {displayList.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${
                  selectedUser?._id === u._id ? "bg-gray-100" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={u.avatar || "/avatars/avatar-default.jpg"}
                    className="w-10 h-10 rounded-full object-cover"
                    alt={u.name}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {u.lastMessage || u.role || "Start a conversation"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CHAT AREA */}
        <section className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
                <img
                  src={selectedUser.avatar || "/avatars/avatar-default.jpg"}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={selectedUser.name}
                />
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
                {messages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mt-10">
                    No messages yet — say hello! 👋
                  </p>
                )}
                {messages.map((m) => {
                  const isMine =
                    String(m.sender?._id) === String(currentUserId) ||
                    String(m.sender) === String(currentUserId);
                  return (
                    <div
                      key={m._id}
                      className={`max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm ${
                        isMine
                          ? "bg-blue-600 text-white self-end"
                          : "bg-white text-gray-800 self-start border"
                      }`}
                    >
                      {m.text}
                      <div className="text-[10px] opacity-60 mt-1 text-right">
                        {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* AI SUGGESTIONS */}
              {suggestions.length > 0 && (
                <div className="px-4 pt-2 pb-1 flex flex-wrap gap-2 bg-white border-t border-gray-100">
                  <span className="text-xs text-gray-400 w-full flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-400" />
                    AI Suggestions
                  </span>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s);
                        setSuggestions([]);
                      }}
                      className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* INPUT */}
              <div className="flex gap-2 p-4 bg-white border-t border-gray-200">
                <button
                  onClick={fetchSuggestions}
                  disabled={loadingSuggestions || messages.length === 0}
                  title="Get AI suggestions"
                  className="text-blue-500 hover:text-blue-700 transition disabled:opacity-30 flex items-center"
                >
                  <Sparkles
                    size={20}
                    className={loadingSuggestions ? "animate-pulse" : ""}
                  />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}