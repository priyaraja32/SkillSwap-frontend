import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Star, Clock, Calendar, MessageSquare, X, Send,
} from "lucide-react";
import api from "../services/api";

export default function ViewProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
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

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/reviews/${id}`),
    ])
      .then(([userRes, reviewRes]) => {
        setUser(userRes.data.data);
        setReviews(reviewRes.data.data || []);
        setAvgRating(reviewRes.data.averageRating || 0);
        setTotalReviews(reviewRes.data.total || 0);
      })
      .catch((err) => {
        console.error("ViewProfile fetch error:", err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/reviews", {
        reviewee: id,
        rating: form.rating,
        comment: form.comment,
        skill: form.skill,
      });

      const newReview = res.data.data;
      setReviews((prev) => [newReview, ...prev]);
      setTotalReviews((prev) => prev + 1);

      const newAvg = [...reviews, newReview].reduce(
        (sum, r) => sum + r.rating, 0
      ) / (reviews.length + 1);
      setAvgRating(Math.round(newAvg * 10) / 10);

      setSuccess("Review submitted! ⭐");
      setShowReviewForm(false);
      setForm({ rating: 5, comment: "", skill: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Centered text="Loading profile..." />;
  if (!user) return <Centered text="Profile not found" />;

  return (
    <div className="min-h-screen bg-[#f6f8ff]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 mb-6"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={user.avatar || "/avatars/avatar-default.jpg"}
              className="w-36 h-36 rounded-full object-cover ring-4 ring-indigo-50"
              alt={user.name}
            />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-500">{user.role || "Skill Swapper"}</p>
              <p className="text-sm text-gray-400 mt-1">{user.location || "India"}</p>

              <div className="flex gap-6 mt-4 text-sm text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> Active recently
                </span>
                <span className="flex items-center gap-1">
                  <StarDisplay rating={avgRating} size={14} />
                  <span className="ml-1 font-semibold">
                    {avgRating > 0 ? avgRating : "New"}
                  </span>
                  {totalReviews > 0 && (
                    <span className="text-gray-400">({totalReviews})</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Joined {new Date(user.createdAt).getFullYear()}
                </span>
              </div>

              {user.about && (
                <p className="mt-4 text-sm text-gray-600 max-w-xl leading-relaxed">
                  {user.about}
                </p>
              )}

              <div className="flex gap-3 mt-6 flex-wrap">
                <Link
                  to={`/request/${id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-sm"
                >
                  Request Swap
                </Link>
                <button
                  onClick={() => setShowMessage(true)}
                  className="border border-gray-200 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-50"
                >
                  <MessageSquare size={16} /> Message
                </button>
                {!isOwnProfile && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="border border-yellow-300 text-yellow-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-yellow-50"
                  >
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    Write Review
                  </button>
                )}
              </div>
            </div>
          </div>

          <SoftDivider />

          <div className="grid md:grid-cols-2 gap-8">
            <Section title="Skills Offered">
              {user.offers?.length
                ? user.offers.map((s) => <Tag key={s} text={s} />)
                : <p className="text-sm text-gray-400">No skills added yet</p>
              }
            </Section>
            <Section title="Wants to Learn">
              {user.needs?.length
                ? user.needs.map((s) => <Tag key={s} text={s} type="need" />)
                : <p className="text-sm text-gray-400">No skills added yet</p>
              }
            </Section>
          </div>

          <SoftDivider />

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm">
              {success}
            </div>
          )}

          {showReviewForm && !isOwnProfile && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border">
              <h3 className="font-bold text-lg mb-4">Write a Review</h3>
              {error && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Rating</label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                      >
                        <Star
                          size={30}
                          className={`transition ${
                            star <= form.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-100"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{form.rating}/5</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Skill Exchanged (optional)
                  </label>
                  <input
                    value={form.skill}
                    onChange={(e) => setForm({ ...form, skill: e.target.value })}
                    placeholder="e.g. React, UI Design"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Review</label>
                  <textarea
                    required
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 border rounded-xl text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <Section title={`Reviews (${totalReviews})`}>
            {totalReviews > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-800">{avgRating}</p>
                    <StarDisplay rating={avgRating} size={16} />
                    <p className="text-xs text-gray-400 mt-1">{totalReviews} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 w-3">{star}</span>
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-yellow-400 h-1.5 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-4">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-6">
                <Star size={36} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No reviews yet</p>
                {!isOwnProfile && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-2 text-indigo-600 text-sm font-semibold"
                  >
                    Be the first to review!
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <img
                        src={r.reviewer?.avatar || "/avatars/avatar-default.jpg"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{r.reviewer?.name}</p>
                            <p className="text-xs text-gray-400">{r.reviewer?.role}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarDisplay rating={r.rating} size={14} />
                          <span className="text-xs font-semibold text-gray-600">
                            {r.rating}/5
                          </span>
                          {r.skill && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                              {r.skill}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {r.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      {showMessage && (
        <MessageModal
          user={user}
          message={message}
          setMessage={setMessage}
          sent={sent}
          setSent={setSent}
          onClose={() => {
            setShowMessage(false);
            setSent(false);
            setMessage("");
          }}
        />
      )}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }) {
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

function MessageModal({ user, message, setMessage, sent, setSent, onClose }) {
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      await api.post("/messages", {
        receiver: user._id,
        text: message,
      });
      setSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">Message {user.name}</h2>
        {sent ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-semibold text-lg">Message Sent! ✓</p>
            <p className="text-gray-400 text-sm mt-1">We'll notify {user.name}</p>
            <button
              onClick={onClose}
              className="mt-4 text-sm text-indigo-600 underline"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full border border-gray-200 rounded-xl p-3 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              onClick={handleSend}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold mt-4"
            >
              Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

function SoftDivider() {
  return <div className="my-8 h-px bg-gray-100" />;
}

function Tag({ text, type }) {
  return (
    <span className={`inline-block mr-2 mb-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
      type === "need"
        ? "bg-orange-50 text-orange-600"
        : "bg-indigo-50 text-indigo-600"
    }`}>
      {text}
    </span>
  );
}

function Centered({ text }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      {text}
    </div>
  );
}