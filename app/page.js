"use client";

/**
 * app/page.js
 * 메인 화면 컴포넌트 (클라이언트 컴포넌트)
 * - 받은 메시지 입력(textarea)
 * - 상황 선택(select): 직장 / 썸 / 친구
 * - "이 답장 괜찮을까?" 버튼
 * - 결과: 위험도 + 추천 답장 3개 카드 (클릭 시 복사)
 */

import { useState } from "react";

export default function Home() {
  // 받은 메시지 내용
  const [message, setMessage] = useState("");
  // 선택한 상황: "work" | "some" | "friend"
  const [situation, setSituation] = useState("friend");
  // API 응답 결과 (위험도, 추천 답장 목록)
  const [result, setResult] = useState(null);
  // 로딩 중 여부
  const [loading, setLoading] = useState(false);
  // API 에러 메시지
  const [error, setError] = useState(null);

  /**
   * "이 답장 괜찮을까?" 버튼 클릭 시 실행
   * POST /api/reply 로 메시지와 상황을 보내고, 결과를 state에 저장
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          situation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "요청 처리 중 오류가 발생했습니다.");
      }

      // 욕설·비속어 차단 시: result 대신 blocked 플래그로 표시
      if (data.blocked) {
        setResult({ blocked: true, message: data.message });
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 추천 답장 카드 클릭 시 클립보드에 복사
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("클립보드에 복사되었습니다!");
    } catch {
      alert("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
    }
  }

  return (
    <main className="main-container">
      <h1 className="title">이 답장 괜찮을까?</h1>
      <p className="subtitle">받은 메시지를 붙여넣고, 상황에 맞는 안전한 답장을 추천받아보세요.</p>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="input-card">
        <label htmlFor="message" className="label">
          받은 메시지
        </label>
        <textarea
          id="message"
          className="message-textarea"
          placeholder="예: 오늘 저녁에 시간 돼?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <label htmlFor="situation" className="label" style={{ marginTop: "1rem" }}>
          상황 선택
        </label>
        <select
          id="situation"
          className="situation-select"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
        >
          <option value="work">직장</option>
          <option value="some">썸</option>
          <option value="friend">친구</option>
        </select>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "분석 중..." : "이 답장 괜찮을까?"}
        </button>
      </form>

      {/* 에러 메시지 */}
      {error && <p className="error-msg">{error}</p>}

      {/* 차단 안내: 욕설·비속어·성적 은어 포함 시 */}
      {result?.blocked && (
        <section className="result-section">
          <div className="blocked-msg">
            <p className="blocked-msg-text">{result.message}</p>
          </div>
        </section>
      )}

      {/* 결과 영역: 위험도 + 추천 답장 3개 */}
      {result && !result.blocked && result.replies && (
        <section className="result-section">
          <p className="recommendations-title">위험도</p>
          <span
            className={`risk-badge ${
              result.risk === "낮음"
                ? "risk-low"
                : result.risk === "보통"
                ? "risk-medium"
                : "risk-high"
            }`}
          >
            {result.risk}
          </span>
          <p className="recommendations-title" style={{ marginTop: "1rem" }}>
            추천 답장 (클릭하면 복사돼요)
          </p>
          {result.replies.map((item, index) => (
            <div
              key={index}
              className="reply-card"
              onClick={() => copyToClipboard(item.text)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") copyToClipboard(item.text);
              }}
            >
              <p className="reply-text">{item.text}</p>
              <p className="reply-comment">{item.comment}</p>
              <p className="copy-hint">클릭하면 복사됩니다</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
