import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function MySkills() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skillsRes, bookingsRes] = await Promise.all([
          api.get("/skills"),
          api.get("/bookings"),
        ]);
        setSkills(skillsRes.data || []);
        setBookings(bookingsRes.data.data || []);
        const mapped = (bookingsRes.data.data || []).map((b) => ({
          id: b._id,
          title: b.skill,
          partner: b.teacher?.name || b.learner?.name || "Unknown",
          date: b.date,
          status: b.status === "completed" ? "Completed" : "Pending",
        }));
        setActivities(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const filteredActivities =
    filter === "All"
      ? activities
      : activities.filter(
          (a) => a.status?.toLowerCase() === filter.toLowerCase()
        );

  return (
    <>
      <Navbar />
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f9fafb",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width: 200,
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
            padding: "28px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <SidebarItem
            icon={<DashboardIcon />}
            label="Dashboard"
            onClick={() => navigate("/dashboard")}
          />
          <SidebarItem
            icon={<SkillsIcon />}
            label="My Skills"
            active
            onClick={() => navigate("/my-skills")}
          />
          <SidebarItem
            icon={<ExploreIcon />}
            label="Explore"
            onClick={() => navigate("/explore-skills")}
          />
          <SidebarItem
            icon={<ProfileIcon />}
            label="Profile"
            onClick={() => navigate("/profile")}
          />
          <SidebarItem
            icon={<SettingsIcon />}
            label="Settings"
            onClick={() => navigate("/settings")}
          />
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: "36px 40px", maxWidth: 1100 }}>

          {/* HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#111",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.3,
                }}
              >
                My Skills
              </h1>
              <p style={{ fontSize: 13, color: "#888", marginTop: 3, fontWeight: 400 }}>
                Manage and track your skills
              </p>
            </div>
            <button
              onClick={() => navigate("/add-skill")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "#1a6fd4",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              + Add Skill
            </button>
          </div>

          {/* STATS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              marginBottom: 32,
            }}
          >
            <StatCard
              label="Skills Offered"
              value={skills.length || 3}
              accent="#1a6fd4"
              iconBg="#eff6ff"
              iconColor="#1a6fd4"
              delta="2 this month"
              icon={<SkillsIcon size={14} />}
            />
            <StatCard
              label="Active Swaps"
              value={bookings.length || 5}
              accent="#16a34a"
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              delta="1 new today"
              icon={<SwapIcon size={14} />}
            />
            <StatCard
              label="Hours Taught"
              value="24h"
              accent="#7c3aed"
              iconBg="#f5f3ff"
              iconColor="#7c3aed"
              delta="3h this week"
              icon={<ClockIcon size={14} />}
            />
            <StatCard
              label="Rating"
              value="4.5"
              accent="#d97706"
              iconBg="#fffbeb"
              iconColor="#d97706"
              delta="12 reviews"
              icon={<StarIcon size={14} />}
            />
          </div>

          {/* SKILLS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Skills</p>
            <button
              style={{
                border: "none",
                background: "none",
                fontSize: 12,
                color: "#1a6fd4",
                cursor: "pointer",
                fontWeight: 400,
              }}
            >
              View all
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <SkillChip
              name="React"
              level="Advanced · 3 learners"
              progress={85}
              barColor="#1a6fd4"
              bg="#eff6ff"
              emoji="⚛️"
            />
            <SkillChip
              name="Node.js"
              level="Intermediate · 2 learners"
              progress={62}
              barColor="#16a34a"
              bg="#f0fdf4"
              emoji="🟩"
            />
            <SkillChip
              name="TypeScript"
              level="Beginner · 1 learner"
              progress={40}
              barColor="#7c3aed"
              bg="#f5f3ff"
              emoji="🔷"
            />
          </div>

          {/* RECENT ACTIVITY */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
              Recent Activity
            </p>
            <div style={{ display: "flex", gap: 3 }}>
              {["All", "Pending", "Completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 11px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: filter === f ? 500 : 400,
                    background: filter === f ? "#dbeafe" : "transparent",
                    color: filter === f ? "#1a6fd4" : "#888",
                    transition: "all 0.15s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#fafafa",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {["Skill", "Partner", "Date", "Status"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#aaa",
                        textAlign: i === 3 ? "right" : "left",
                        padding: "10px 18px",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "2.5rem",
                        textAlign: "center",
                        fontSize: 13,
                        color: "#aaa",
                        fontWeight: 400,
                      }}
                    >
                      No activity found.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((a) => (
                    <ActivityRow key={a.id} {...a} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}

/* ── Sub-components ── */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? "#1a6fd4" : "#666",
        background: active ? "#eff6ff" : "transparent",
        border: "none",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: 15,
          height: 15,
          flexShrink: 0,
          opacity: active ? 1 : 0.6,
        }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function StatCard({ label, value, accent, iconBg, iconColor, delta, icon }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 12,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 2,
          background: accent,
          borderRadius: "12px 12px 0 0",
        }}
      />
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "#111",
          marginTop: 3,
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 11,
          color: "#16a34a",
          marginTop: 6,
          fontWeight: 400,
        }}
      >
        {delta}
      </p>
    </div>
  );
}

function SkillChip({ name, level, progress, barColor, bg, emoji }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 10,
        padding: "13px 14px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#111",
            letterSpacing: "0.01em",
          }}
        >
          {name}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "#999",
            marginTop: 1,
            fontWeight: 400,
          }}
        >
          {level}
        </p>
        <div
          style={{
            height: 2,
            background: "#f0f0f0",
            borderRadius: 2,
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: 2,
              width: `${progress}%`,
              background: barColor,
              borderRadius: 2,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ title, partner, date, status }) {
  const isCompleted = status === "Completed";
  return (
    <tr
      style={{
        borderBottom: "1px solid #f5f5f5",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "12px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "#eff6ff",
              color: "#1a6fd4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CodeIcon />
          </div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#111",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </p>
        </div>
      </td>
      <td
        style={{
          padding: "12px 18px",
          fontSize: 13,
          color: "#555",
          fontWeight: 400,
        }}
      >
        {partner}
      </td>
      <td
        style={{
          padding: "12px 18px",
          fontSize: 12,
          color: "#999",
          fontWeight: 400,
        }}
      >
        {date}
      </td>
      <td style={{ padding: "12px 18px", textAlign: "right" }}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            background: isCompleted ? "#f0fdf4" : "#fffbeb",
            color: isCompleted ? "#16a34a" : "#d97706",
            letterSpacing: "0.02em",
          }}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}

/* ── Icons (size prop controls dimension) ── */

function DashboardIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function SkillsIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
function ExploreIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function ProfileIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function SettingsIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function SwapIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
    </svg>
  );
}
function ClockIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function StarIcon({ size = 15 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function CodeIcon({ size = 13 }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"
      strokeWidth={1.5} width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}