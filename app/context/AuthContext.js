"use client";

/**
 * app/context/AuthContext.js
 * 로그인 상태를 전역으로 제공 (sessionStorage와 동기화)
 */
import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "jom-yamujim-user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const persistUser = (u) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (userId, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "로그인에 실패했어요.");
      err.code = data.code;
      throw err;
    }
    persistUser(data.user);
    return data.user;
  };

  const logout = () => {
    persistUser(null);
  };

  const registerAndLogin = async ({ userId, password, gender, email }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password, gender, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "회원가입에 실패했어요.");
    persistUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerAndLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
