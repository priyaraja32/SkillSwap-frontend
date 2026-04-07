import {
  Search, ArrowRight, TrendingUp, Trophy,
  Monitor, PenTool, Camera, Calendar, Clock, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const normalizeMatch = (match) => {
  if (match >= 80) return Math.min(match, 100);
  if (match >= 40) return Math.max(match, 40);
  if (match > 0) return Math.max(match, 20);
  return 0;
};

const AVAILABILITY_OPTIONS = ["Any", "Weekdays", "Weekends", "Evenings"];

const DAY_MAP = {
  Weekdays: ["mon", "tue", "wed", "thu", "fri"],
  Weekends: ["sat", "sun"],
};

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [requested, setRequested] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [availability, setAvailability] = useState("Any");
  const [currentUser, setCurrentUser] = useState(null);

  const lastQueryRef = useRef("");
  const lastAvailabilityRef = useRef("");

  const isSearching = query.trim().length > 0;

  //  FETCH USERS
  useEffect(() => {
    api.get("/users")
      .then((res) => {
        const users = res.data.data.map((u) => ({
          id: String(u._id),
          name: u.name,
          role: u.role || "Skill Swapper",
          image: u.avatar || "/profile-default.jpg",
          offers: u.offers || [],
          needs: u.needs || [],
          availability: u.availability || [],
          lastActive: new Date(u.createdAt).toLocaleDateString("en-IN"),
          match: 0,
          matchReason: "",
        }));

        setAllUsers(users);
        setMatches(users);
      })
      .finally(() => setLoading(false));
  }, []);

  //  CURRENT USER
  useEffect(() => {
    api.get("/users/me")
      .then((res) => setCurrentUser(res.data.data))
      .catch(() => {});
  }, []);

  //  FILTER + BACKEND MATCH
  useEffect(() => {
    if (!allUsers.length || !currentUser) return;

    const timer = setTimeout(async () => {
      let filtered = [...allUsers];

      //  SEARCH
      if (isSearching) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.offers.some((o) => o.toLowerCase().includes(q)) ||
            u.needs.some((n) => n.toLowerCase().includes(q))
        );
      }

      //  AVAILABILITY
      if (availability !== "Any") {
        filtered = filtered.filter((u) => {
          if (!Array.isArray(u.availability)) return false;

          return u.availability.some((slot) => {
            const day = slot?.day?.toLowerCase();

            if (availability === "Evenings") {
              const hour = Number(slot.startTime?.split(":")[0]);
              return hour >= 17;
            }

            return DAY_MAP[availability]?.includes(day);
          });
        });
      }

      //  CHECK CHANGE
      const shouldCall =
        lastQueryRef.current !== query ||
        lastAvailabilityRef.current !== availability;

      if (!shouldCall) {
        setMatches(filtered);
        return;
      }

      lastQueryRef.current = query;
      lastAvailabilityRef.current = availability;

      try {
        setAiLoading(true);

      //Api call to get AI matches
        const res = await api.get("/match"); 

        const aiData = res.data.data || [];

        const updated = filtered.map((u) => {
          const found = aiData.find(
            (m) => String(m.id) === String(u.id)
          );

          return {
            ...u,
            match: normalizeMatch(found?.match || 0),
            matchReason: found?.reason || "",
          };
        });

        updated.sort((a, b) => b.match - a.match);

        setMatches(updated);
      } catch (err) {
        console.log("Match API failed", err);
        setMatches(filtered);
      } finally {
        setAiLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, allUsers, availability, currentUser]);



  return (
    <div className="min-h-screen" style={{ background: "#f8f7ff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .dash-root { font-family: 'Inter', sans-serif; }
        .dash-hero-title { font-family: 'Syne', sans-serif; }
        .search-bar { background: white; border: 1.5px solid #e8e5ff; border-radius: 100px; box-shadow: 0 4px 24px rgba(99,77,255,0.08); transition: box-shadow 0.2s, border-color 0.2s; }
        .search-bar:focus-within { box-shadow: 0 8px 32px rgba(99,77,255,0.15); border-color: #a78bfa; }
        .search-btn { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 100px; font-family: 'Syne', sans-serif; font-weight: 600; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 2px 12px rgba(99,77,255,0.25); }
        .search-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,77,255,0.35); }
        .avail-btn { padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; border: 1.5px solid; cursor: pointer; font-family: 'Syne', sans-serif; transition: all 0.15s; }
        .avail-btn.active { background: #6366f1; color: white; border-color: #6366f1; }
        .avail-btn.inactive { background: white; color: #6366f1; border-color: #c4b5fd; }
        .avail-btn.inactive:hover { background: #f5f3ff; }
        .user-card { background: white; border-radius: 20px; border: 1.5px solid #f0eeff; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(99,77,255,0.04); }
        .user-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(99,77,255,0.1); border-color: #c4b5fd; }
        .avatar-ring { border: 3px solid transparent; background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #6366f1, #8b5cf6) border-box; border-radius: 9999px; }
        .offer-tag { background: linear-gradient(135deg,#eef2ff,#ede9fe); color: #5b21b6; border: 1px solid #ddd6fe; border-radius: 100px; font-size: 11px; font-weight: 600; padding: 3px 10px; display: inline-block; margin: 2px; }
        .need-tag { background: linear-gradient(135deg,#fff7ed,#ffedd5); color: #c2410c; border: 1px solid #fed7aa; border-radius: 100px; font-size: 11px; font-weight: 600; padding: 3px 10px; display: inline-block; margin: 2px; }
        .match-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif; }
        .match-high { background: #d1fae5; color: #065f46; }
        .match-mid { background: #fef3c7; color: #92400e; }
        .match-low { background: #f3f4f6; color: #6b7280; }
        .avail-slot { display: inline-flex; align-items: center; gap: 3px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 100px; font-size: 10px; font-weight: 600; padding: 2px 8px; margin: 2px; }
        .side-card { background: white; border-radius: 20px; border: 1.5px solid #f0eeff; box-shadow: 0 2px 8px rgba(99,77,255,0.04); }
        .trend-row { border-bottom: 1px solid #f5f3ff; transition: background 0.15s; border-radius: 12px; }
        .trend-row:hover { background: #f9f8ff; }
        .view-btn { color: #7c3aed; font-weight: 600; font-size: 13px; transition: color 0.15s; text-decoration: none; }
        .view-btn:hover { color: #5b21b6; }
        .swap-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 100px; font-size: 13px; font-weight: 600; padding: 7px 18px; border: none; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: 'Syne', sans-serif; box-shadow: 0 2px 10px rgba(99,77,255,0.2); }
        .swap-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(99,77,255,0.32); }
        .swap-btn:disabled { background: #e5e7eb; color: #9ca3af; box-shadow: none; transform: none; cursor: not-allowed; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg,#eef2ff,#ede9fe); border: 1px solid #c4b5fd; border-radius: 100px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #6d28d9; margin-bottom: 16px; font-family: 'Syne', sans-serif; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #1e1b4b; }
        .user-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #1e1b4b; }
        .loading-skeleton { background: linear-gradient(90deg,#f3f4f6 25%,#e9e7ff 50%,#f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 12px; height: 120px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .challenge-card { background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 60%,#a78bfa 100%); border-radius: 20px; color: white; padding: 20px; }
        .ai-loading { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8b5cf6; font-weight: 600; justify-content: center; padding: 8px 0; }
        .ai-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .match-reason { font-size: 10px; color: #6b7280; margin-top: 3px; font-style: italic; }
      `}</style>

      <div className="dash-root">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* HERO */}
          <div className="text-center mb-14">
            <div className="hero-badge"><Sparkles size={12} />AI-Powered Skill Matching</div>
            <h1 className="dash-hero-title mb-3" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#1e1b4b", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Welcome back 👋
            </h1>
            <p style={{ color: "#6b7280", fontSize: 16, marginBottom: 32 }}>Discover people to swap skills with</p>

            <div className="max-w-2xl mx-auto">
              <div className="search-bar flex items-center px-5 py-3 gap-3">
                <Search size={18} style={{ color: "#a78bfa", flexShrink: 0 }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by skill, name, or role..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, color: "#1e1b4b", fontFamily: "Inter, sans-serif" }}
                />
                <button className="search-btn flex items-center gap-2 px-5 py-2.5 text-white text-sm">
                  Search <ArrowRight size={15} />
                </button>
              </div>

              {isSearching && (
                <p style={{ fontSize: 12, color: "#8b5cf6", marginTop: 8 }}>
                  {matches.length} result{matches.length !== 1 ? "s" : ""} for "{query}"
                </p>
              )}

              {/* AVAILABILITY FILTER */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 14 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, alignSelf: "center" }}>
                  <Clock size={12} style={{ display: "inline", marginRight: 4 }} />Availability:
                </span>
                {AVAILABILITY_OPTIONS.map((a) => (
                  <button key={a} onClick={() => setAvailability(a)} className={`avail-btn ${availability === a ? "active" : "inactive"}`}>
                    {a}
                  </button>
                ))}
              </div>

              {aiLoading && (
                <div className="ai-loading mt-3">
                  <Sparkles size={14} className="ai-spin" />
                  {isSearching ? "AI matching users..." : "Finding best matches for you..."}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">
                  {isSearching ? "AI Matched Users" : "Recommended For You"}
                </h2>
                <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600, background: "#ede9fe", borderRadius: 100, padding: "3px 12px" }}>
                  {matches.length} people
                </span>
              </div>

              {loading && <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="loading-skeleton" />)}</div>}

              {!loading && matches.length === 0 && (
                <div style={{ background: "white", borderRadius: 20, padding: 48, textAlign: "center", border: "1.5px solid #f0eeff" }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
                  <p style={{ color: "#6b7280", fontWeight: 500 }}>
                    No users found{query ? ` for "${query}"` : ""}{availability !== "Any" ? ` with ${availability} availability` : ""}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {matches.map((m) => (
                  <div key={m.id} className="user-card p-6">
                    <div className="flex gap-5">
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <img src={m.image} alt={m.name} className="avatar-ring"
                          style={{ width: 88, height: 88, objectFit: "cover", display: "block", margin: "0 auto" }}
                          onError={(e) => { e.target.src = "/profile-default.jpg"; }} />
                        <p className="user-name mt-2">{m.name}</p>
                        <p style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 600, marginTop: 2 }}>{m.role}</p>
                        <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                          <Clock size={10} /> {m.lastActive}
                        </p>

                        {/* MATCH BADGE — always show if match > 0 */}
                        {m.match > 0 && (
                          <div style={{ marginTop: 6 }}>
                            <span className={`match-badge ${m.match >= 80 ? "match-high" : m.match >= 40 ? "match-mid" : "match-low"}`}>
                              <Sparkles size={10} />{m.match}% match
                            </span>
                            {/* REASON */}
                            {m.matchReason && (
                              <p className="match-reason">{m.matchReason}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "Syne, sans-serif" }}>OFFERS</p>
                            {m.offers.length ? m.offers.map((o) => <span key={o} className="offer-tag">{o}</span>) : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#f97316", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "Syne, sans-serif" }}>NEEDS</p>
                            {m.needs.length ? m.needs.map((n) => <span key={n} className="need-tag">{n}</span>) : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                          </div>
                        </div>

                        {/* AVAILABILITY SLOTS */}
                        {m.availability?.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#10b981", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "Syne, sans-serif" }}>AVAILABLE</p>
                            {m.availability.slice(0, 3).map((slot, i) => (
                              <span key={i} className="avail-slot">
                                <Clock size={9} />{slot.day.charAt(0).toUpperCase() + slot.day.slice(1)} {slot.startTime}–{slot.endTime}
                              </span>
                            ))}
                            {m.availability.length > 3 && <span style={{ fontSize: 10, color: "#9ca3af" }}> +{m.availability.length - 3} more</span>}
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #f5f3ff" }}>
                          <Link to={`/profile/${m.id}`} className="view-btn">View Profile →</Link>
                          <button onClick={() => setRequested((p) => ({ ...p, [m.id]: true }))} disabled={requested[m.id]} className="swap-btn">
                            {requested[m.id] ? "✓ Requested" : "Request Swap"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-5">
              <div className="side-card p-5">
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#1e1b4b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={16} style={{ color: "#8b5cf6" }} />Trending Skills
                </h3>
                {[
                  { icon: <Monitor size={14} />, label: "Web Dev", value: "+12%", color: "#6366f1" },
                  { icon: <PenTool size={14} />, label: "UX Design", value: "+8%", color: "#8b5cf6" },
                  { icon: <Camera size={14} />, label: "Photography", value: "+5%", color: "#a78bfa" },
                ].map((t) => (
                  <div key={t.label} className="trend-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", color: t.color }}>{t.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{t.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", background: "#d1fae5", borderRadius: 100, padding: "2px 8px" }}>{t.value}</span>
                  </div>
                ))}
              </div>

              <div className="side-card p-5">
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#1e1b4b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={16} style={{ color: "#8b5cf6" }} />Upcoming Sessions
                </h3>
                {[
                  { title: "React Pair Programming", time: "Tomorrow · 7 PM" },
                  { title: "UX Review", time: "Friday · 6:30 PM" },
                ].map((s) => (
                  <div key={s.title} style={{ background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b", fontFamily: "Syne, sans-serif" }}>{s.title}</p>
                    <p style={{ fontSize: 11, color: "#8b5cf6", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} /> {s.time}</p>
                  </div>
                ))}
              </div>

              <div className="challenge-card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Trophy size={18} style={{ color: "#fde68a" }} />
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15 }}>Community Challenge</span>
                </div>
                <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>Teach 3 hours this week to earn your Mentor badge 🏅</p>
                <div style={{ marginTop: 14, background: "rgba(255,255,255,0.15)", borderRadius: 100, height: 6, overflow: "hidden" }}>
                  <div style={{ width: "60%", height: "100%", background: "#fde68a", borderRadius: 100 }} />
                </div>
                <p style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>1.8 / 3 hours completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}