/**
 * app/api/auth/store.js
 * 회원 정보 인메모리 저장소 (재시작 시 초기화됨)
 * 프로덕션에서는 DB 사용 권장
 */
const users = new Map();

function findByUserId(userId) {
  return users.get(String(userId).trim()) ?? null;
}

function addUser({ userId, password, gender, email }) {
  const id = String(userId).trim();
  if (users.has(id)) return null;
  users.set(id, {
    userId: id,
    password: String(password),
    gender: String(gender),
    email: String(email).trim(),
  });
  return users.get(id);
}

function toPublicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export { users, findByUserId, addUser, toPublicUser };
