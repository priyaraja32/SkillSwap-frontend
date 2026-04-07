import api from "./api";

export const signup = (data) => {
  return api.post("/auth/register", data);
};

export const login = (data) => {
  return api.post("/auth/login", data);
};