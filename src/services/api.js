import axios from "axios";

const api = axios.create({
  baseURL: "https://skillswap-backend-v4s4.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* USERS */
export const fetchUsers = () => api.get("/users");

/* SKILLS */
export const fetchSkills = () => api.get("/skills");
export const addSkill = (data) => api.post("/skills", data);

/* ACTIVITIES */
export const fetchActivities = () => api.get("/activities");

/* MESSAGES — NEW */
export const fetchConversations = () => api.get("/messages");
export const fetchConversation = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (receiver, text) => api.post("/messages", { receiver, text });
export const suggestMessages = (context) => api.post("/messages/suggest", { context });

/* AVAILABILITY — NEW */
export const saveAvailability = (availability) => api.put("/availability", { availability });
export const fetchMatches = () => api.get("/availability/matches");

/* shared instance */
export const sheetApi = api;
export default api;