"use client";

/**
 * app/components/Header.js
 * 오른쪽 위 로그인 칸, 로그인/회원가입 모달
 */
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, login, logout, registerAndLogin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupId, setSignupId] = useState("");
  const [signupPw, setSignupPw] = useState("");
  const [signupGender, setSignupGender] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loading, setLoading] = useState(false);

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
    setLoginError("");
    setLoginId("");
    setLoginPw("");
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
    setSignupError("");
    setSignupId("");
    setSignupPw("");
    setSignupGender("");
    setSignupEmail("");
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
    setLoginError("");
    setSignupError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      await login(loginId.trim(), loginPw);
      closeModals();
    } catch (err) {
      setLoginError(err.message);
      if (err.code === "NOT_FOUND") {
        setLoginError("등록되지 않은 계정이에요. 회원가입을 해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");
    setLoading(true);
    try {
      await registerAndLogin({
        userId: signupId.trim(),
        password: signupPw,
        gender: signupGender,
        email: signupEmail.trim(),
      });
      closeModals();
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <span className="header-logo">이 답장 괜찮을까?</span>
          <div className="header-auth">
            {user ? (
              <>
                <span className="header-user">{user.userId}님</span>
                <button type="button" className="header-btn header-btn-outline" onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : (
              <button type="button" className="header-btn header-btn-primary" onClick={openLogin}>
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 로그인 모달 */}
      {showLogin && (
        <div className="modal-overlay" onClick={closeModals} role="presentation">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">로그인</h2>
            <form onSubmit={handleLoginSubmit}>
              <label className="modal-label">아이디</label>
              <input
                type="text"
                className="modal-input"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="아이디"
                required
                autoComplete="username"
              />
              <label className="modal-label">비밀번호</label>
              <input
                type="password"
                className="modal-input"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="비밀번호"
                required
                autoComplete="current-password"
              />
              {loginError && <p className="modal-error">{loginError}</p>}
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn-ghost" onClick={openSignup}>
                  회원가입
                </button>
                <button type="submit" className="modal-btn modal-btn-primary" disabled={loading}>
                  {loading ? "로그인 중..." : "로그인"}
                </button>
              </div>
            </form>
            <button type="button" className="modal-close" onClick={closeModals} aria-label="닫기">
              ×
            </button>
          </div>
        </div>
      )}

      {/* 회원가입 모달 - 아이디, 비밀번호, 성별, 이메일 순 */}
      {showSignup && (
        <div className="modal-overlay" onClick={closeModals} role="presentation">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">회원가입</h2>
            <form onSubmit={handleSignupSubmit}>
              <label className="modal-label">아이디</label>
              <input
                type="text"
                className="modal-input"
                value={signupId}
                onChange={(e) => setSignupId(e.target.value)}
                placeholder="아이디"
                required
                autoComplete="username"
              />
              <label className="modal-label">비밀번호</label>
              <input
                type="password"
                className="modal-input"
                value={signupPw}
                onChange={(e) => setSignupPw(e.target.value)}
                placeholder="비밀번호"
                required
                autoComplete="new-password"
              />
              <label className="modal-label">성별</label>
              <select
                className="modal-input modal-select"
                value={signupGender}
                onChange={(e) => setSignupGender(e.target.value)}
              >
                <option value="">선택</option>
                <option value="남">남</option>
                <option value="여">여</option>
                <option value="기타">기타</option>
              </select>
              <label className="modal-label">이메일</label>
              <input
                type="email"
                className="modal-input"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="이메일"
                required
                autoComplete="email"
              />
              {signupError && <p className="modal-error">{signupError}</p>}
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn-ghost" onClick={openLogin}>
                  로그인
                </button>
                <button type="submit" className="modal-btn modal-btn-primary" disabled={loading}>
                  {loading ? "가입 중..." : "회원가입"}
                </button>
              </div>
            </form>
            <button type="button" className="modal-close" onClick={closeModals} aria-label="닫기">
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
