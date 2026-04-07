import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  LayoutDashboard, GraduationCap, User,
  Settings as SettingsIcon, LogOut, Upload,
  Shield, Bell, MapPin, Briefcase, Star,
  Check, Eye, EyeOff,
} from "lucide-react";
import api from "../services/api";

export default function Settings() {
  const navigate  = useNavigate();

 //  get user ID from localStorage
  const currentUser   = JSON.parse(localStorage.getItem("user") || "{}");
  const userId        = currentUser._id || currentUser.id;

  const [profileImage, setProfileImage] = useState(
    currentUser.avatar || "/profile-default.jpg"
  );

  const [form, setForm] = useState({
    name:     currentUser.name     || "",
    email:    currentUser.email    || "",
    role:     currentUser.role     || "",
    location: "",
    about:    "",
    offers:   "",
    needs:    "",
  });

  const [notifications, setNotifications] = useState({
    email:     true,
    messages:  true,
    reminders: false,
  });

  const [passwords, setPasswords] = useState({ current: "", newPwd: "" });
  const [showPassword, setShowPassword]   = useState(false);
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [pwSaving, setPwSaving]           = useState(false);
  const [pwSaved, setPwSaved]             = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  //  fetch real user data from backend
  useEffect(() => {
    if (!userId) return;
    api.get("/users/me")
      .then((res) => {
        const u = res.data.data;
        setForm({
          name:     u.name     || "",
          email:    u.email    || "",
          role:     u.role     || "",
          location: u.location || "",
          about:    u.about    || "",
          offers:   (u.offers || []).join(", "),
          needs:    (u.needs  || []).join(", "),
        });
        setNotifications({
          email:     u.notifyEmail     ?? true,
          messages:  u.notifyMessages  ?? true,
          reminders: u.notifyReminders ?? false,
        });
        if (u.avatar) setProfileImage(u.avatar);
      })
      .catch(() => {});
  }, [userId]);

  //  save profile
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.put("/users/me", {
        name:            form.name,
        email:           form.email,
        role:            form.role,
        location:        form.location,
        about:           form.about,
        offers:          form.offers.split(",").map((s) => s.trim()).filter(Boolean),
        needs:           form.needs.split(",").map((s) => s.trim()).filter(Boolean),
        notifyEmail:     notifications.email,
        notifyMessages:  notifications.messages,
        notifyReminders: notifications.reminders,
      });

     //  update localStorage with new user data
      const updated = res.data.data;
      localStorage.setItem("user", JSON.stringify({
        ...currentUser,
        name:   updated.name,
        email:  updated.email,
        avatar: updated.avatar,
        role:   updated.role,
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Failed to save changes");
    }
    setSaving(false);
  };

  //  change password
  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPwd) {
      alert("Please fill all password fields");
      return;
    }
    setPwSaving(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: passwords.current,
        newPassword:     passwords.newPwd,
      });
      setPwSaved(true);
      setPasswords({ current: "", newPwd: "" });
      setShowPassword(false);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
    setPwSaving(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileImage(url);
  };

  const navItems = [
    { id: "profile",       icon: <User size={16} />,           label: "Profile" },
    { id: "notifications", icon: <Bell size={16} />,           label: "Notifications" },
    { id: "security",      icon: <Shield size={16} />,         label: "Security" },
  ];

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">

        {/* ── Sidebar ── */}
        <aside className="w-64 bg-white border-r border-gray-100 px-5 py-8 hidden lg:flex flex-col">

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={profileImage}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50"
                onError={(e) => { e.target.src = "/profile-default.jpg"; }}
              />
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer shadow">
                <Upload size={12} className="text-white" />
                <input hidden type="file" accept="image/*" onChange={handleProfileUpload} />
              </label>
            </div>
            <p className="font-semibold mt-3 text-gray-800">{form.name || "User"}</p>
            <p className="text-xs text-indigo-500 mt-0.5">{form.role || "Member"}</p>
          </div>

          {/* Nav */}
          <nav className="space-y-1 flex-1">
            {navItems.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeSection === id
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                {icon} {label}
              </button>
            ))}

            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition"
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button
                onClick={() => navigate(`/profile/${userId}`)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition"
              >
                <User size={16} /> View Profile
              </button>
            </div>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition px-4 py-2.5 rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} /> Log out
          </button>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 px-6 py-8 max-w-3xl">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage your account</p>
            </div>
            {activeSection === "profile" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {saved ? <><Check size={15} /> Saved!</> : saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>

          {/* ── Profile Section ── */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <Card title="Profile Information">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Full Name" icon={<User size={13} />}>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="field-input"
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="field-input"
                      placeholder="you@email.com"
                      type="email"
                    />
                  </Field>
                  <Field label="Role" icon={<Briefcase size={13} />}>
                    <input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="field-input"
                      placeholder="e.g. Mentor, Student"
                    />
                  </Field>
                  <Field label="Location" icon={<MapPin size={13} />}>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="field-input"
                      placeholder="City, Country"
                    />
                  </Field>
                </div>
                <Field label="Bio" className="mt-6">
                  <textarea
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    rows={3}
                    className="field-input resize-none"
                    placeholder="Tell others about yourself..."
                  />
                </Field>
              </Card>

              <Card title="Skills">
                <Field label="Skills I Offer" icon={<Star size={13} />}>
                  <input
                    value={form.offers}
                    onChange={(e) => setForm({ ...form, offers: e.target.value })}
                    className="field-input"
                    placeholder="React, Design, Python (comma separated)"
                  />
                </Field>
                <Field label="Skills I Want to Learn" className="mt-4">
                  <input
                    value={form.needs}
                    onChange={(e) => setForm({ ...form, needs: e.target.value })}
                    className="field-input"
                    placeholder="ML, Music, Spanish (comma separated)"
                  />
                </Field>
              </Card>
            </div>
          )}

          {/* ── Notifications Section ── */}
          {activeSection === "notifications" && (
            <Card title="Notification Preferences">
              <div className="space-y-4">
                {[
                  { key: "email",     label: "Email notifications",   desc: "Receive updates via email" },
                  { key: "messages",  label: "Message notifications", desc: "Get notified for new messages" },
                  { key: "reminders", label: "Session reminders",     desc: "Reminders before sessions" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications[key] ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        notifications[key] ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                {saving ? "Saving..." : saved ? "Saved ✓" : "Save Preferences"}
              </button>
            </Card>
          )}

          {/* ── Security Section ── */}
          {activeSection === "security" && (
            <Card title="Change Password">
              {pwSaved && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2">
                  <Check size={15} /> Password updated successfully!
                </div>
              )}
              <div className="space-y-4">
                <Field label="Current Password">
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="field-input pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
                <Field label="New Password">
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.newPwd}
                      onChange={(e) => setPasswords({ ...passwords, newPwd: e.target.value })}
                      className="field-input pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
              </div>
              <button
                onClick={handleChangePassword}
                disabled={pwSaving}
                className="mt-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </Card>
          )}
        </main>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          border: 0.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 14px;
          color: #1f2937;
          outline: none;
          transition: border-color 0.15s;
          background: #fafafa;
        }
        .field-input:focus {
          border-color: #6366f1;
          background: white;
        }
      `}</style>
    </>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, icon, children, className = "" }) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}