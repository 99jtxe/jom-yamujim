/**
 * app/api/auth/register/route.js
 * POST /api/auth/register - 회원가입 (아이디, 비밀번호, 성별, 이메일)
 */
import { NextResponse } from "next/server";
import { addUser } from "../store";

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = (body.userId ?? body.id ?? "").toString().trim();
    const password = (body.password ?? "").toString();
    const gender = (body.gender ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim();

    if (!userId || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해 주세요." },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해 주세요." },
        { status: 400 }
      );
    }

    const added = addUser({ userId, password, gender, email });
    if (!added) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디예요." },
        { status: 409 }
      );
    }

    const { password: _, ...publicUser } = added;
    return NextResponse.json({
      success: true,
      user: publicUser,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
