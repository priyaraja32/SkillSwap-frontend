import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Check, Clock, X } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function RequestSwap() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [toUser, setToUser] = useState(null);
  const [form, setForm] = useState({
    offerSkill: "",
    wantSkill: "",
    message: "",
    availability: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = storedUser?._id || storedUser?.id || "";

  useEffect(() => {
    if (!id) {
      setFetching(false);
      return;
    }
    api.get(`/users/${id}`)
      .then((res) => {
        const u = res.data.data;
        setToUser(u);
        setForm((prev) => ({
          ...prev,
          wantSkill: u.offers?.[0] || "",
        }));
      })
      .catch(() => setError("Could not load user info"))
      .finally(() => setFetching(false));
  }, [id]);

  useEffect(() => {
    api.get("/users/me")
      .then((res) => {
        const me = res.data.data;
        setForm((prev) => ({
          ...prev,
          offerSkill: me.offers?.[0] || "",
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/swaprequests")
      .then((res) => {
        const data = res.data.data || [];
        console.log("currentUserId:", currentUserId);
        console.log("requests:", data.map(r => ({
          from: r.fromUser?._id,
          to: r.toUser?._id,
        })));
        setRequests(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setReqLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/swaprequests", {
        toUser: id,
        offerSkill: form.offerSkill,
        wantSkill: form.wantSkill,
        message: form.message,
        availability: form.availability,
      });
      setSuccess(true);
      const res = await api.get("/swaprequests");
      setRequests(res.data.data || []);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reqId, status) => {
    try {
      await api.patch(`/swaprequests/${reqId}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === reqId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const received = requests.filter(
    (r) => String(r.toUser?._id) === String(currentUserId)
  );
  const sent = requests.filter(
    (r) => String(r.fromUser?._id) === String(currentUserId)
  );
  const display = activeTab === "received" ? received : sent;

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* SEND REQUEST FORM */}
        {id && (
          <div className="mb-10">
            {toUser && (
              <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
                <img
                  src={toUser.avatar || "/avatar-default.jpg"}
                  className="w-14 h-14 rounded-full object-cover"
                  onError={(e) => { e.target.src = "/avatar-default.jpg"; }}
                />
                <div>
                  <p className="font-semibold text-lg">{toUser.name}</p>
                  <p className="text-sm text-gray-500">{toUser.role} • {toUser.location}</p>
                  {toUser.offers?.length > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">
                      Offers: {toUser.offers.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm flex items-center gap-2">
                <Check size={16} /> Request sent successfully!
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-2">Request Skill Swap</h1>
              <p className="text-gray-500 mb-8">Send a request to start a skill exchange.</p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold mb-2">Skill You Offer</label>
                  <input
                    name="offerSkill"
                    value={form.offerSkill}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="e.g. React, Node.js"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Auto-filled from your profile — edit if needed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Skill You Want to Learn</label>
                  <input
                    name="wantSkill"
                    value={form.wantSkill}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="e.g. UI Design, Figma"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Auto-filled from their profile — edit if needed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="4"
                    required
                    placeholder="Introduce yourself and explain why you want to swap..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Your Availability</label>
                  <input
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="e.g. Weekends, Evenings after 7 PM"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  <Send size={16} />
                  {loading ? "Sending..." : "Send Request"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ALL SWAP REQUESTS */}
        <h2 className="text-2xl font-bold mb-6">My Swap Requests</h2>

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
              activeTab === "received"
                ? "bg-indigo-600 text-white"
                : "bg-white border text-gray-600"
            }`}
          >
            Received ({received.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
              activeTab === "sent"
                ? "bg-indigo-600 text-white"
                : "bg-white border text-gray-600"
            }`}
          >
            Sent ({sent.length})
          </button>
        </div>

        {reqLoading && <p className="text-gray-400 text-sm">Loading requests...</p>}

        {!reqLoading && display.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border">
            <p className="text-gray-400">No {activeTab} requests yet</p>
          </div>
        )}

        <div className="space-y-4">
          {display.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={
                    activeTab === "received"
                      ? r.fromUser?.avatar || "/avatar-default.jpg"
                      : r.toUser?.avatar || "/avatar-default.jpg"
                  }
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.src = "/avatar-default.jpg"; }}
                />
                <div>
                  <p className="font-semibold">
                    {activeTab === "received" ? r.fromUser?.name : r.toUser?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "received" ? r.fromUser?.role : r.toUser?.role}
                  </p>
                </div>

                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                  r.status === "Pending"  ? "bg-yellow-100 text-yellow-700" :
                  r.status === "Accepted" ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {r.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Offering</p>
                  <p className="text-sm font-semibold text-indigo-700">{r.offerSkill}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Wants to Learn</p>
                  <p className="text-sm font-semibold text-orange-700">{r.wantSkill}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Message</p>
                <p className="text-sm text-gray-600">{r.message}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {r.availability}
                </span>
                <span>
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </span>
              </div>

              {activeTab === "received" && r.status === "Pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(r._id, "Accepted")}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-semibold text-sm transition"
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    onClick={() => handleAction(r._id, "Rejected")}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold text-sm transition"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}