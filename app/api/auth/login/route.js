/**
 * app/api/auth/login/route.js
 * POST /api/auth/login - 로그인 (아이디, 비밀번호)
 */
import { NextResponse } from "next/server";
import { findByUserId, toPublicUser } from "../store";

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = (body.userId ?? body.id ?? "").toString().trim();
    const password = (body.password ?? "").toString();

    if (!userId || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    const user = findByUserId(userId);
    if (!user) {
      return NextResponse.json(
        { error: "등록되지 않은 계정이에요. 회원가입을 해 주세요.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    if (user.password !== password) {
      return NextResponse.json(
        { error: "비밀번호가 맞지 않아요." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
