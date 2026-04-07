import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Video,
  Check,
  X,
  Calendar,
  Clock,
  BookOpen,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    teacher: "", skill: "", date: "", time: "", notes: "", meetLink: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    api.get("/bookings")
      .then((res) => setBookings(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get("/users")
      .then((res) => setUsers(res.data.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/bookings", form);
      setBookings((prev) => [res.data.data, ...prev]);
      setShowForm(false);
      setForm({ teacher: "", skill: "", date: "", time: "", notes: "", meetLink: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book session");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    await api.patch(`/bookings/${id}`, { status });
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status } : b))
    );
  };

  const tabs = {
    upcoming:  bookings.filter((b) => b.status === "pending" || b.status === "confirmed"),
    completed: bookings.filter((b) => b.status === "completed"),
    cancelled: bookings.filter((b) => b.status === "cancelled"),
  };
  const display = tabs[activeTab] || [];

  const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return dateStr; }
  };

  const STATUS = {
    pending:   { label: "pending",   color: "#d97706", bg: "#fffbeb" },
    confirmed: { label: "confirmed", color: "#16a34a", bg: "#f0fdf4" },
    completed: { label: "completed", color: "#1a6fd4", bg: "#eff6ff" },
    cancelled: { label: "cancelled", color: "#dc2626", bg: "#fef2f2" },
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-blue-600 mb-2 no-underline font-normal"
            >
              <ArrowLeft size={12} strokeWidth={1.8} />
              Back to Dashboard
            </Link>
            <h1 style={{ fontSize: 21, fontWeight: 600, color: "#111",
              letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              My Bookings
            </h1>
            <p style={{ fontSize: 12, color: "#888", marginTop: 3, fontWeight: 400 }}>
              {bookings.length} session{bookings.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: showForm ? "#fff" : "#1a6fd4",
              color: showForm ? "#1a6fd4" : "#fff",
              border: showForm ? "1px solid #1a6fd4" : "none",
              borderRadius: 9, padding: "9px 16px",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            <Plus size={14} strokeWidth={2} />
            New Booking
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #eeeff2",
            borderRadius: 14, padding: "22px 24px", marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 16 }}>
              Schedule a Session
            </p>

            {error && (
              <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 12,
                background: "#fef2f2", padding: "8px 12px", borderRadius: 7 }}>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select
                required
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                style={inputStyle}
              >
                <option value="">Choose teacher</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>

              <input
                required
                value={form.skill}
                placeholder="Skill (e.g. React, Node.js)"
                onChange={(e) => setForm({ ...form, skill: e.target.value })}
                style={inputStyle}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <textarea
                value={form.notes}
                placeholder="Notes (optional)"
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
              />

              <input
                value={form.meetLink}
                placeholder="Google Meet link (optional)"
                onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                style={inputStyle}
              />

              <button
                type="submit"
                style={{ background: "#1a6fd4", color: "#fff", border: "none",
                  borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", marginTop: 4,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {saving ? (
                  <><Loader2 size={14} strokeWidth={2} className="animate-spin" /> Saving…</>
                ) : "Book Session"}
              </button>
            </form>
          </div>
        )}

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20,
          background: "#fff", border: "1px solid #eeeff2",
          borderRadius: 10, padding: 4 }}>
          {["upcoming", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 7, border: "none",
                fontSize: 12, fontWeight: activeTab === tab ? 500 : 400,
                cursor: "pointer", transition: "all 0.15s",
                background: activeTab === tab ? "#1a6fd4" : "transparent",
                color: activeTab === tab ? "#fff" : "#888",
                textTransform: "capitalize",
              }}
            >
              {tab}
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginLeft: 6, minWidth: 17, height: 17, borderRadius: 20,
                fontSize: 10, fontWeight: 600,
                background: activeTab === tab ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                color: activeTab === tab ? "#fff" : "#6b7280",
              }}>
                {tabs[tab]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>
            <Loader2 size={22} strokeWidth={1.5} className="animate-spin" style={{ margin: "0 auto" }} />
          </div>
        )}

        {/* EMPTY */}
        {!loading && display.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0",
            background: "#fff", border: "1px solid #eeeff2", borderRadius: 14 }}>
            <Calendar size={32} strokeWidth={1.2} color="#ccc" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>
              No {activeTab} bookings
            </p>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
              {activeTab === "upcoming" ? "Book a session to get started." : "Nothing here yet."}
            </p>
          </div>
        )}

        {/* BOOKING CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {display.map((b) => {
            const isTeacher = b.teacher?._id === currentUserId;
            const other     = isTeacher ? b.learner : b.teacher;
            const st        = STATUS[b.status] || STATUS.pending;

            return (
              <div
                key={b._id}
                style={{ background: "#fff", border: "1px solid #eeeff2",
                  borderRadius: 14, padding: "18px 20px", transition: "box-shadow 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Person row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  {other?.avatar ? (
                    <img
                      src={other.avatar}
                      alt={other.name}
                      style={{ width: 40, height: 40, borderRadius: "50%",
                        objectFit: "cover", border: "1.5px solid #eeeff2" }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: "50%",
                      background: "#eff6ff", color: "#1a6fd4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                      {initials(other?.name)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                      {other?.name || "Unknown"}
                    </p>
                    <p style={{ fontSize: 11, color: "#aaa", marginTop: 1, fontWeight: 400 }}>
                      {other?.role || (isTeacher ? "Learner" : "Teacher")}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500,
                    padding: "3px 10px", borderRadius: 20,
                    background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>

                {/* Info chips */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap",
                  marginBottom: b.meetLink || b.status === "pending" ? 12 : 0 }}>
                  <Chip icon={<BookOpen size={11} strokeWidth={1.8} />} label={b.skill} />
                  <Chip icon={<Calendar size={11} strokeWidth={1.8} />} label={formatDate(b.date)} />
                  <Chip icon={<Clock size={11} strokeWidth={1.8} />} label={b.time} />
                </div>

                {/* Meet link */}
                {b.meetLink && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10,
                    background: "#eff6ff", border: "1px solid #bfdbfe",
                    borderRadius: 9, padding: "9px 12px",
                    marginBottom: b.status === "pending" ? 12 : 0 }}>
                    <Video size={13} strokeWidth={1.8} color="#1a6fd4" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#1a6fd4", flex: 1,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.meetLink}
                    </span>
                    <a
                      href={b.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: "#1a6fd4", color: "#fff",
                        padding: "4px 12px", borderRadius: 6,
                        fontSize: 11, fontWeight: 500, textDecoration: "none", flexShrink: 0 }}
                    >
                      Join
                    </a>
                  </div>
                )}

                {/* Actions */}
                {b.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {isTeacher && (
                      <button
                        onClick={() => handleStatus(b._id, "confirmed")}
                        style={{ flex: 1, display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 6,
                          background: "#f0fdf4", color: "#16a34a",
                          border: "1px solid #bbf7d0", borderRadius: 8,
                          padding: "8px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                      >
                        <Check size={13} strokeWidth={2} /> Confirm
                      </button>
                    )}
                    <button
                      onClick={() => handleStatus(b._id, "cancelled")}
                      style={{ flex: 1, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 6,
                        background: "#fef2f2", color: "#dc2626",
                        border: "1px solid #fecaca", borderRadius: 8,
                        padding: "8px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                    >
                      <X size={13} strokeWidth={2} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple reusable chip component
function Chip({ icon, label }) {
  if (!label) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
      background: "#f7f8fa", border: "1px solid #eeeff2",
      borderRadius: 7, padding: "4px 10px",
      fontSize: 12, color: "#444", fontWeight: 400 }}>
      <span style={{ color: "#888", display: "flex" }}>{icon}</span>
      {label}
    </span>
  );
}

// Common input style
const inputStyle = {
  width: "100%",
  background: "#f7f8fa",
  border: "1px solid #eeeff2",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  color: "#111",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
};