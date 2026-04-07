import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Code2, Music, Camera, Languages, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import api from "../services/api"; //  use your backend api

export default function AddSkill() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("code");
  const [level, setLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const categories = [
    { id: "code",      label: "Programming",  icon: <Code2 size={18} /> },
    { id: "music",     label: "Music",        icon: <Music size={18} /> },
    { id: "camera",    label: "Photography",  icon: <Camera size={18} /> },
    { id: "translate", label: "Languages",    icon: <Languages size={18} /> },
  ];

  //  fetch skill for edit mode from backend
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/skills`)
      .then((res) => {
        const skills = res.data || [];
        const s = skills.find((sk) => sk._id === id);
        if (s) {
          setTitle(s.title);
          setCategory(s.category);
          setLevel(s.level);
        }
      })
      .catch(() => {});
  }, [id, isEdit]);

  //  save to backend
  const handleSave = async () => {
    if (!title.trim()) {
      setToast({ type: "error", message: "Skill name is required" });
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        // update existing skill
        await api.patch(`/skills/${id}`, { title, category, level });
      } else {
        // add new skill
        await api.post("/skills", { title, category, level });
      }

      setToast({
        type: "success",
        message: isEdit
          ? "Skill updated successfully "
          : "Skill added successfully ",
      });

      setTimeout(() => navigate("/my-skills"), 900);

    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to save skill",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f6f8ff] px-6 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="text-gray-500">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-semibold">
              {isEdit ? "Edit Skill" : "Add New Skill"}
            </h1>
          </div>

          {/* TITLE */}
          <div className="mb-6">
            <label className="text-xs text-gray-500">Skill name</label>
            <input
              className="w-full mt-2 rounded-xl px-4 py-3 text-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="React, Guitar, Photography..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* CATEGORY */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">Category</p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border transition ${
                    category === c.id
                      ? "border-blue-400 bg-blue-50 text-blue-600"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* LEVEL */}
          <div className="mb-8">
            <p className="text-xs text-gray-500 mb-2">Skill level</p>
            <div className="flex gap-3">
              {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-4 py-2 rounded-full text-xs border transition ${
                    level === lvl
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-100 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm shadow-sm disabled:opacity-60"
            >
              {loading ? "Saving..." : isEdit ? "Update Skill" : "Add Skill"}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}