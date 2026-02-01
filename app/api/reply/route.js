/**
 * app/api/reply/route.js
 * Next.js App Router API 라우트
 * POST /api/reply 요청을 받아, 규칙 기반으로 위험도를 판단하고
 * 상황별 추천 답장 3개를 반환합니다.
 */

import { NextResponse } from "next/server";

// ========== 차단 단어 목록 (욕설·비속어·성적 은어) ==========
// 이 단어가 메시지에 포함되면 분석하지 않고 차단합니다.
// 필요에 따라 단어를 추가할 수 있습니다.
const BLOCKED_WORDS = [
  // 욕설·비속어
  "시발", "씨발", "ㅅㅂ", "ㅂㅅ", "지랄", "닥쳐", "엿먹", "꺼져",
  "미친", "미쳤", "또라이", "병신", "븅신", "새끼", "니애미", "니엄마",
  "죽어", "디질", "썅", "놈", "년", "걸레", "쓰레기",
  // 성적 은어 (일상 단어와 겹치는 것은 제외)
  "섹스", "섹스해", "야동", "포르노", "에로", "검열삭제",
  "자지", "보지", "딸치", "딸쳐", "섹스하", "성교",
  "야한", "야해", "벗겨", "항문", "오럴", "오랄",
  "애액", "정액", "몰카", "몰캠", "캠방", "합방", "야캠",
];

// ========== 규칙 1: 위험 단어 목록 ==========
// 이 단어가 메시지에 포함되면 위험도가 올라갑니다.
const RISKY_WORDS_HIGH = [
  "화났", "미워", "이별", "결별", "싫어", "질투", "의심", "거짓", "배신",
];
const RISKY_WORDS_MEDIUM = [
  "진지하게", "결심", "중요한", "말해", "왜", "설명", "기다려", "급해",
];

// ========== 규칙 2: 상황별·메시지 유형별 추천 답장 (우문현답 방지) ==========
const RECOMMENDATIONS = {
  work: {
    meeting: [
      { text: "넵 그때 뵐게요", comment: "약속 수락할 때 써요." },
      { text: "네 알겠습니다. 그때 말씀드릴게요.", comment: "시간 잡을 때 써요." },
    ],
    confirmation: [
      { text: "넵 알겠습니다", comment: "짧게 확인했다고 할 때 써요." },
      { text: "네 확인했어요. 곧 답변 드릴게요.", comment: "받았다고 알려줄 때 써요." },
      { text: "확인했습니다. 반영할게요.", comment: "체크했다고 할 때 써요." },
    ],
    thanks: [
      { text: "감사합니다 잘 참고할게요.", comment: "감사 인사 받았을 때 써요." },
      { text: "네 감사합니다.", comment: "짧게 감사할 때 써요." },
    ],
    general: [
      { text: "넵 알겠습니다", comment: "짧고 밝게 답할 때 많이 써요." },
      { text: "네 확인했어요. 곧 답변 드릴게요.", comment: "받았다는 걸 알려줄 때 좋아요." },
      { text: "감사합니다 잘 참고할게요.", comment: "부담 없이 감사 표현할 때 써요." },
    ],
  },
  some: {
    meeting: [
      { text: "그래 그때 보자", comment: "만나기 수락할 때 써요." },
      { text: "오 좋아", comment: "기대되게 수락할 때 써요." },
      { text: "그날에 봐", comment: "약속 잡을 때 써요." },
      { text: "오케이 그때 보자", comment: "가볍게 수락할 때 써요." },
      { text: "응 나도 기대할게", comment: "공감하면서 수락할 때 써요." },
    ],
    confirmation: [
      { text: "ㄹㅇ 좋다", comment: "제안/내용 좋다고 할 때 써요." },
      { text: "알겠어 그때 연락할게", comment: "확인했다고 할 때 써요." },
      { text: "당연하지", comment: "당연히 그렇다고 할 때 써요." },
    ],
    general: [
      { text: "그래 그때 보자", comment: "수락할 때 자연스럽게 써요." },
      { text: "오 좋아", comment: "기대되는 느낌으로 답할 때 써요." },
      { text: "ㄹㅇ 좋다", comment: "진짜 좋다 할 때 써요." },
      { text: "알겠어 그때 연락할게", comment: "다음에 연락하겠다고 할 때 써요." },
      { text: "응 나도 기대할게", comment: "공감하면서 약속할 때 써요." },
      { text: "그날에 봐", comment: "약속 잡을 때 가볍게 써요." },
      { text: "당연하지", comment: "당연히 그렇다고 할 때 써요." },
      { text: "오케이 그때 보자", comment: "가볍게 수락할 때 써요." },
    ],
  },
  friend: {
    meeting: [
      { text: "ㄱㄱ", comment: "가자고 할 때 써요." },
      { text: "그래 그때 보자", comment: "만나기 수락할 때 써요." },
      { text: "그래 그렇게 하자", comment: "제안에 동의할 때 써요." },
      { text: "오케이", comment: "수락할 때 써요." },
    ],
    confirmation: [
      { text: "알겠어", comment: "알겠다고 할 때 써요." },
      { text: "ㅇㅋ", comment: "OK 할 때 써요." },
      { text: "ㅇㅇ", comment: "그렇다고 할 때 써요." },
      { text: "응", comment: "짧게 수락할 때 써요." },
    ],
    general: [
      { text: "알겠어", comment: "알겠다고 할 때 써요." },
      { text: "그래 그래", comment: "수긍할 때 써요." },
      { text: "오케이", comment: "OK 할 때 써요." },
      { text: "당연하지", comment: "당연히 그렇다고 할 때 써요." },
      { text: "그래 그렇게 하자", comment: "제안에 동의할 때 써요." },
      { text: "응", comment: "짧게 수락할 때 써요." },
      { text: "ㅇㅋ", comment: "짧게 OK 할 때 써요." },
      { text: "ㄱㄱ", comment: "바로 가자 할 때 써요." },
      { text: "ㅇㅇ", comment: "알겠다 할 때 써요." },
    ],
  },
};

/**
 * 받은 메시지가 무슨 유형인지 휴리스틱으로 판단 (우문현답 방지용)
 * @returns {"meeting" | "confirmation" | "thanks" | "general"}
 */
function inferMessageType(message) {
  if (!message || typeof message !== "string") return "general";
  const m = message.trim().toLowerCase();
  const hasMeeting = /시간|만나|보자|저녁|점심|몇\s*시|언제|그때|나자|만날/.test(m);
  const hasConfirmation = /확인|봤어|체크|봐줘|확인해|봤니|봤나/.test(m);
  const hasThanks = /고마워|감사|고맙|땡큐|thx/.test(m);
  if (hasMeeting) return "meeting";
  if (hasConfirmation) return "confirmation";
  if (hasThanks) return "thanks";
  return "general";
}

/** 배열에서 랜덤으로 n개 뽑기 (복원 없이) */
function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/** 상황·메시지 유형에 맞는 추천 풀 가져오기 (없으면 general) */
function getRecommendationPool(situation, messageType) {
  const bySituation = RECOMMENDATIONS[situation] ?? RECOMMENDATIONS.friend;
  const pool = bySituation[messageType] ?? bySituation.general;
  return Array.isArray(pool) ? pool : bySituation.general;
}

/**
 * 받은 메시지(message)와 선택한 상황(situation)을 바탕으로
 * 위험도(낮음/보통/높음)를 규칙 기반으로 계산합니다.
 */
function calculateRisk(message) {
  if (!message || typeof message !== "string") {
    return "낮음";
  }

  const trimmed = message.trim();
  const length = trimmed.length;
  let score = 0;

  // 규칙 A: 메시지 길이
  if (length < 5) score += 1;        // 너무 짧으면 맥락 파악 어려움
  if (length > 150) score += 1;     // 매우 길면 민감한 내용일 수 있음

  // 규칙 B: 위험 단어 포함 여부
  const lower = trimmed.toLowerCase();
  for (const word of RISKY_WORDS_HIGH) {
    if (lower.includes(word)) {
      score += 2;
      break;
    }
  }
  for (const word of RISKY_WORDS_MEDIUM) {
    if (lower.includes(word)) {
      score += 1;
      break;
    }
  }

  // 점수 → 위험도
  if (score >= 3) return "높음";
  if (score >= 1) return "보통";
  return "낮음";
}

/**
 * 메시지가 반말(비격식)로 되어 있는지 휴리스틱으로 판단합니다.
 * 직장 상황에서는 존댓말만 허용할 때 사용합니다.
 * @returns {boolean} 반말로 보이면 true
 */
function looksLikeInformalSpeech(message) {
  if (!message || typeof message !== "string") return false;
  const trimmed = message.trim();
  if (trimmed.length === 0) return false;

  // 문장 끝 부분 확인 (마지막 1~4글자)
  const last1 = trimmed.slice(-1);
  const last2 = trimmed.slice(-2);
  const last3 = trimmed.slice(-3);

  // 존댓말로 보이는 끝: 요, 다(습니다/합니다), 네요, 세요, 예요, 에요, 주세요 등
  if (last1 === "요") return false;
  if (last1 === "다") return false; // ~습니다, ~합니다
  if (last2 === "네요" || last2 === "세요" || last2 === "예요" || last2 === "에요") return false;
  if (last3 === "주세요" || last3 === "드려요" || last3 === "드릴게") return false;
  if (/습니다|합니다|드립니다$/.test(trimmed)) return false;

  // 반말로 보이는 끝
  if (/[해어야]$/.test(trimmed)) return true;  // ~해, ~어, ~야
  if (/[자니냐]$/.test(trimmed)) return true;
  if (/[가-힣](거든|잖아|할게|갈게|볼게|올게|할래|갈래)\s*$/.test(trimmed)) return true;
  if (/[해어야][?!.]?\s*$/.test(trimmed)) return true; // ~해? ~어! 등

  return false;
}

/**
 * 메시지에 욕설·비속어가 포함되었는지 확인합니다.
 * 포함되면 true를 반환합니다.
 */
function containsBlockedWords(message) {
  if (!message || typeof message !== "string") return false;
  const lower = message.trim().toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return true;
  }
  return false;
}

/**
 * POST /api/reply
 * body: { message: string, situation: "work" | "some" | "friend" }
 * response: { risk: string, replies: [{ text, comment }, ...] }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.message ?? "";
    const situation = body.situation ?? "friend";

    // situation이 허용된 값인지 확인
    const allowedSituations = ["work", "some", "friend"];
    const safeSituation = allowedSituations.includes(situation) ? situation : "friend";

    // 0) 욕설·비속어 포함 시 차단 (분석하지 않음)
    if (containsBlockedWords(message)) {
      return NextResponse.json(
        { blocked: true, message: "욕설, 비속어 또는 성적 은어가 포함된 메시지는 분석하지 않습니다." },
        { status: 200 }
      );
    }

    // 0-1) 직장 선택 시: 받은 메시지가 반말이면 차단 (존댓말만 허용)
    if (safeSituation === "work" && looksLikeInformalSpeech(message)) {
      return NextResponse.json(
        { blocked: true, message: "직장에서는 존댓말로 된 메시지만 분석할 수 있어요. 받은 메시지를 존댓말로 바꿔서 다시 입력해 주세요." },
        { status: 200 }
      );
    }

    // 1) 위험도 계산
    const risk = calculateRisk(message);

    // 2) 해당 상황의 추천 답장 3개 가져오기
    const messageType = inferMessageType(message);
    const pool = getRecommendationPool(safeSituation, messageType);
    const replies = pickRandom(pool, 3);

    return NextResponse.json({
      risk,
      replies,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "서버 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
