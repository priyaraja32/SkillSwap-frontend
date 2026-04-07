import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();         // gets token from URL
  const navigate  = useNavigate();

  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage]             = useState("");
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, {
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000); // redirect after 2s
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Reset Password</h2>
        <p className="text-gray-500 mb-6 text-sm">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600 text-sm text-center">
            {message} Redirecting to login...
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
}