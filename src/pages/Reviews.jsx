import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function Reviews() {
  const { id } = useParams(); // reviewee user id
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [toUser, setToUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    rating: 5,
    comment: "",
    skill: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = String(currentUserId) === String(id);

  // fetch user info + reviews
  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/reviews/${id}`),
    ])
      .then(([userRes, reviewRes]) => {
        setToUser(userRes.data.data);
        setReviews(reviewRes.data.data || []);
        setAvgRating(reviewRes.data.avgRating || 0);
        setTotal(reviewRes.data.total || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/reviews", {
        reviewee: id,
        rating: form.rating,
        comment: form.comment,
        skill: form.skill,
      });

      setReviews((prev) => [res.data.data, ...prev]);
      setTotal((prev) => prev + 1);

      // recalculate avg
      const newAvg = [...reviews, res.data.data].reduce(
        (sum, r) => sum + r.rating, 0
      ) / (reviews.length + 1);
      setAvgRating(Math.round(newAvg * 10) / 10);

      setSuccess("Review submitted successfully! ⭐");
      setShowForm(false);
      setForm({ rating: 5, comment: "", skill: "" });

    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* BACK */}
        <Link
          to={`/profile/${id}`}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold mb-6"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        {/* USER + RATING SUMMARY */}
        {toUser && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border mb-6">
            <div className="flex items-center gap-5">
              <img
                src={toUser.avatar || "/avatars/avatar-default.jpg"}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{toUser.name}</h1>
                <p className="text-gray-500 text-sm">{toUser.role} • {toUser.location}</p>

                {/* AVERAGE RATING */}
                <div className="flex items-center gap-3 mt-3">
                  <StarDisplay rating={avgRating} size={24} />
                  <span className="text-2xl font-bold text-gray-800">
                    {avgRating > 0 ? avgRating : "No ratings yet"}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({total} {total === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              {/* WRITE REVIEW BUTTON */}
              {!isOwnProfile && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  <Star size={16} />
                  Write Review
                </button>
              )}
            </div>

            {/* RATING BREAKDOWN */}
            {total > 0 && (
              <div className="mt-6 border-t pt-6">
                <p className="text-sm font-semibold text-gray-500 mb-3">Rating breakdown</p>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const percent = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-500 w-4">{star}</span>
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* WRITE REVIEW FORM */}
        {showForm && !isOwnProfile && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <h2 className="font-bold text-lg mb-4">Write a Review</h2>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* STAR RATING PICKER */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition ${
                          star <= form.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 self-center">
                    {form.rating}/5
                  </span>
                </div>
              </div>

              {/* SKILL */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Skill Exchanged (optional)
                </label>
                <input
                  value={form.skill}
                  onChange={(e) => setForm({ ...form, skill: e.target.value })}
                  placeholder="e.g. React, UI Design"
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                />
              </div>

              {/* COMMENT */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Review
                </label>
                <textarea
                  required
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Share your experience with this skill swap..."
                  rows={4}
                  className="w-full border rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Send size={16} />
                  {saving ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REVIEWS LIST */}
        <h2 className="text-xl font-bold mb-4">
          All Reviews {total > 0 && `(${total})`}
        </h2>

        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border">
            <Star size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No reviews yet</p>
            {!isOwnProfile && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-indigo-600 text-sm font-semibold"
              >
                Be the first to review!
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-6 border shadow-sm">
              <div className="flex items-start gap-4">

                {/* REVIEWER AVATAR */}
                <img
                  src={r.reviewer?.avatar || "/avatars/avatar-default.jpg"}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{r.reviewer?.name}</p>
                      <p className="text-xs text-gray-400">{r.reviewer?.role}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>

                  {/* STARS */}
                  <div className="flex items-center gap-2 mt-2">
                    <StarDisplay rating={r.rating} size={16} />
                    <span className="text-sm font-semibold text-gray-700">
                      {r.rating}/5
                    </span>
                    {r.skill && (
                      <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                        {r.skill}
                      </span>
                    )}
                  </div>

                  {/* COMMENT */}
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// reusable star display component
function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-200 fill-gray-200"
          }
        />
      ))}
    </div>
  );
}