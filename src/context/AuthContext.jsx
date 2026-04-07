import { createContext, useContext, useState } from "react";
import { sheetApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // LOGIN
  const login = async (email, password) => {
    const res = await sheetApi.get("/Users");

    const found = res.data.Users.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) throw new Error("Invalid credentials");

    setUser(found);
    localStorage.setItem("user", JSON.stringify(found));
  };

  // SIGNUP
  const signup = async (data) => {
    const res = await sheetApi.post("/Users", {
      Users: data,
    });

    setUser(res.data.Users);
    localStorage.setItem("user", JSON.stringify(res.data.Users));
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

