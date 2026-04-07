import {
  Sparkles,
  Star,
  Music,
  Code,
  Languages,
  Paintbrush,
  Users,
} from "lucide-react";

function SignupRight() {
  return (
    <div className="grid gap-6">

      {/* AI Matching Card */}

      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs mb-4 font-medium">
          <Sparkles size={14} />
          AI POWERED
        </span>

        <h2 className="text-2xl font-bold mb-3">
          Perfect Matches, Instantly.
        </h2>
        <p className="text-gray-500 mb-6">
          Our AI analyzes your skills and goals to connect you with the ideal
          learning partner in seconds.
        </p>

        {/* Matching Skills */}

        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-indigo-50 p-4 rounded-xl">
            <Music className="mx-auto text-indigo-600" />
            <p className="text-sm mt-2">Music</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <Code className="mx-auto text-purple-600" />
            <p className="text-sm mt-2">Coding</p>
          </div>

          <div className="bg-pink-50 p-4 rounded-xl">
            <Languages className="mx-auto text-pink-600" />
            <p className="text-sm mt-2">Languages</p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl">
            <Paintbrush className="mx-auto text-green-600" />
            <p className="text-sm mt-2">Design</p>
          </div>
        </div>
      </div>

      {/* Community */}

      <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold">10k+</h2>
          <p className="opacity-90 mt-1">Active Skill Swappers</p>
        </div>
        <Users size={40} className="opacity-30" />
      </div>

      {/* Testimonial with Lucide Stars icons*/}

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <p className="font-medium mb-4">
          “I learned Spanish while teaching Python. Best exchange ever!”
        </p>

        <div className="flex items-center gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill="currentColor" />
          ))}
          <span className="text-gray-400 text-sm ml-2">4.9 / 5</span>
        </div>
      </div>
    </div>
  );
}
export default SignupRight
