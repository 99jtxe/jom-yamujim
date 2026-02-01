/**
 * app/layout.js
 * Next.js App Router의 루트 레이아웃
 * 모든 페이지에 공통으로 적용되는 HTML 구조와 메타 정보를 정의합니다.
 */
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";

export const metadata = {
  title: "이 답장 괜찮을까? | 카톡/DM 답장 추천",
  description: "받은 메시지를 붙여넣고, 상황에 맞는 안전한 답장을 추천받아보세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
