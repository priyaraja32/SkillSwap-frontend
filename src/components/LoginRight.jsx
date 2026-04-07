export default function LoginRight() {
  return (
    <div className="hidden lg:flex flex-col justify-center space-y-6">

      {/* IMAGE CARD */}
      <div className="rounded-3xl overflow-hidden shadow-xl bg-white">
        <img
          src="/swapAI.png"
          alt="AI Network"
          className="h-64 w-full object-cover"
        />

        <div className="p-6">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            AI POWERED
          </div>

          <h3 className="text-xl font-bold mb-2">
            AI-Powered Matching
          </h3>

          <p className="text-gray-500 text-sm leading-relaxed">
            Our algorithm connects you with the perfect skill partner in
            seconds, not days.
          </p>
        </div>
      </div>

      {/* STATS CARD */}
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl">
        <p className="text-xs tracking-wide opacity-80">
          COMMUNITY GROWTH
        </p>

        <h2 className="text-3xl font-bold mt-2">
          12,450+
        </h2>

        <p className="opacity-90 mt-1 text-sm">
          Skills exchanged this week
        </p>
      </div>

    </div>
  );
}
