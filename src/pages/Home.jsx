import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Navbar
        infoText="Already a member?"
        infoLinkText="Log in"
        infoLink="/login"
        actionText="Get Started"
        actionLink="/signup"
      />

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          <Sparkles size={16} />
          AI Powered Skill Exchange
        </div>

        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          Learn Faster by <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Swapping Skills
          </span>
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          SkillSwap connects learners and mentors instantly using AI-based
          matching. Teach what you know. Learn what you love.
        </p>

        <div className="flex justify-center gap-5">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-full font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700 shadow-lg transition"
          >
            Start for Free
          </Link>

          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-full font-semibold text-indigo-600
              bg-white border border-indigo-200 hover:bg-indigo-50 transition
              flex items-center gap-2"
          >
            Explore Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Feature
          title="AI Matching"
          desc="Find perfect learning partners instantly."
        />
        <Feature
          title="Skill Swapping"
          desc="Teach one skill, learn another for free."
        />
        <Feature
          title="Verified Community"
          desc="Trusted learners & mentors worldwide."
        />
      </div>
    </div>
  );
}

/* COMPONENT */
function Feature({ title, desc }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
