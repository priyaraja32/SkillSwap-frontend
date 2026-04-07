import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, MapPin, Briefcase, Plus, X } from "lucide-react";
import api from "../services/api";
import SignupRight from "../components/SignupRight";

const ROLES = [
  "Developer", "Designer", "Student", "Mentor",
  "Teacher", "Freelancer", "Backend Developer",
  "Full Stack Developer", "UI/UX Designer", "Other"
];

const SKILLS_SUGGESTIONS = [
  "React", "Node.js", "Python", "JavaScript", "Figma",
  "UI Design", "MongoDB", "Express", "Django", "Photography",
  "Music", "Guitar", "Piano", "English", "Tamil", "Data Science",
  "Machine Learning", "Flutter", "Java", "PHP"
];

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // step 1 = basic, step 2 = profile
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // step 2
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [offers, setOffers] = useState([]); // skills they teach
  const [needs, setNeeds] = useState([]);   // skills they want
  const [offerInput, setOfferInput] = useState("");
  const [needInput, setNeedInput] = useState("");

  // add skill tag
  const addOffer = (skill) => {
    const s = skill.trim();
    if (s && !offers.includes(s)) setOffers([...offers, s]);
    setOfferInput("");
  };

  const addNeed = (skill) => {
    const s = skill.trim();
    if (s && !needs.includes(s)) setNeeds([...needs, s]);
    setNeedInput("");
  };

  const removeOffer = (s) => setOffers(offers.filter((o) => o !== s));
  const removeNeed = (s) => setNeeds(needs.filter((n) => n !== s));

  // step 1 validation
  const handleStep1 = (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setStep(2);
  };

  //  final submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select your role");
      return;
    }
    if (offers.length === 0) {
      setError("Please add at least one skill you can teach");
      return;
    }
    if (needs.length === 0) {
      setError("Please add at least one skill you want to learn");
      return;
    }

    setLoading(true);

    try {
      //  register with all details
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        location,
        about,
        offers,
        needs,
      });

      navigate("/login");

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-10 shadow-xl">

          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold">Log in</Link>
            </p>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>1</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-gray-200"}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>2</div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* STEP 1 — BASIC INFO  */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Step 1 — Basic Information
              </p>

              <Input
                icon={<User size={18} />}
                type="text"
                value={name}
                setValue={setName}
                label="Full name"
                autoComplete="name"
              />
              <Input
                icon={<Mail size={18} />}
                type="email"
                value={email}
                setValue={setEmail}
                label="Email address"
                autoComplete="email"
              />
              <Input
                icon={<Lock size={18} />}
                type="password"
                value={password}
                setValue={setPassword}
                label="Password (min 6 characters)"
                autoComplete="new-password"
              />
              <Input
                icon={<Lock size={18} />}
                type="password"
                value={confirm}
                setValue={setConfirm}
                label="Confirm password"
                autoComplete="new-password"
              />

              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Next →
              </button>
            </form>
          )}

          {/* STEP 2 — PROFILE SETUP */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Step 2 — Setup Your Profile
              </p>

              {/* ROLE */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Your Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-2 rounded-xl text-sm border transition text-left ${
                        role === r
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* LOCATION */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location (e.g. Chennai, India)"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* ABOUT */}
              <div>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="About you (optional) — e.g. I love teaching React and learning new things"
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>

              {/* SKILLS YOU OFFER */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Skills You Can Teach
                </label>

                {/* selected tags */}
                {offers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {offers.map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                      >
                        {s}
                        <button type="button" onClick={() => removeOffer(s)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOffer(offerInput);
                      }
                    }}
                    placeholder="Type skill and press Enter"
                    className="flex-1 px-4 py-2 rounded-xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => addOffer(offerInput)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* suggestions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {SKILLS_SUGGESTIONS.filter(
                    (s) => !offers.includes(s)
                  ).slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addOffer(s)}
                      className="px-2 py-1 text-xs border rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* SKILLS YOU WANT TO LEARN */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Skills You Want to Learn
                </label>

                {needs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {needs.map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"
                      >
                        {s}
                        <button type="button" onClick={() => removeNeed(s)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={needInput}
                    onChange={(e) => setNeedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNeed(needInput);
                      }
                    }}
                    placeholder="Type skill and press Enter"
                    className="flex-1 px-4 py-2 rounded-xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => addNeed(needInput)}
                    className="px-3 py-2 bg-orange-500 text-white rounded-xl"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {SKILLS_SUGGESTIONS.filter(
                    (s) => !needs.includes(s)
                  ).slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addNeed(s)}
                      className="px-2 py-1 text-xs border rounded-full text-gray-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border rounded-2xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition"
                >
                  {loading ? "Creating account..." : "Create Account 🎉"}
                </button>
              </div>
            </form>
          )}
        </div>

        <SignupRight />
      </div>
    </div>
  );
}

function Input({ icon, type, value, setValue, label, autoComplete }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={label}
        autoComplete={autoComplete}
        className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  );
}

