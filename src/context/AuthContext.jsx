import { useState } from "react";
import * as authService from "../services/authService";
import { AuthContext } from "./authContext";

const readStoredUser = () => {
  const storedUser = localStorage.getItem("ciseauxuser");
  const token = localStorage.getItem("ciseauxtoken");
  return storedUser && token ? JSON.parse(storedUser) : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("ciseauxtoken", data.token);
    localStorage.setItem("ciseauxuser", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    return authService.signup(payload);
  };

  const logout = () => {
    localStorage.removeItem("ciseauxtoken");
    localStorage.removeItem("ciseauxuser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
