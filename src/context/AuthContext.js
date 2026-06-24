import React, { createContext, useContext, useMemo, useState } from 'react';
import { CURRENT_USER } from '../data/mockData';
import { loginWithProvider, logout as apiLogout, withdrawUser } from '../api/authApi';

const AuthContext = createContext(null);

const INITIAL_TERMS = { t1: false, t2: false, t2b: false, t3: false };

export function AuthProvider({ children }) {
  // isLoggedIn: 로그인 화면 ↔ 메인 탭 전환을 결정
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(CURRENT_USER);
  const [pendingProvider, setPendingProvider] = useState(null); // 약관 모달 띄우기 전 선택한 소셜 로그인
  const [terms, setTerms] = useState(INITIAL_TERMS);

  // 필수 약관(t1, t2, t2b) 전부 동의해야 가입 완료 버튼 활성화
  const requiredAgreed = terms.t1 && terms.t2 && terms.t2b;

  async function startLogin(providerKey, providerLabel) {
    setPendingProvider({ key: providerKey, label: providerLabel });
    setUser((prev) => ({ ...prev, loginType: providerLabel }));
    // 실제 OAuth 플로우는 여기서 트리거합니다 (예: expo-auth-session).
    // 백엔드 연동 시 결과 토큰을 받아 user 상태를 갱신하면 됩니다.
  }

  function toggleTerm(key) {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function agreeTermsAndLogin() {
    if (!requiredAgreed || !pendingProvider) return;
    try {
      const result = await loginWithProvider(pendingProvider.key);
      if (result?.user) setUser((prev) => ({ ...prev, ...result.user }));
    } catch (e) {
      // 백엔드 미연동 상태에서도 화면 흐름은 진행되도록 mock 처리
      console.warn('[auth] loginWithProvider fallback (mock):', e?.message);
    }
    setIsLoggedIn(true);
    setPendingProvider(null);
  }

  async function logout() {
    try {
      await apiLogout();
    } catch (e) {
      console.warn('[auth] logout fallback (mock):', e?.message);
    }
    setIsLoggedIn(false);
    setTerms(INITIAL_TERMS);
  }

  async function withdraw() {
    try {
      await withdrawUser();
    } catch (e) {
      console.warn('[auth] withdraw fallback (mock):', e?.message);
    }
    setIsLoggedIn(false);
    setTerms(INITIAL_TERMS);
  }

  function updateProfile(patch) {
    setUser((prev) => ({ ...prev, ...patch }));
  }

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      pendingProvider,
      terms,
      requiredAgreed,
      startLogin,
      toggleTerm,
      agreeTermsAndLogin,
      logout,
      withdraw,
      updateProfile,
    }),
    [isLoggedIn, user, pendingProvider, terms, requiredAgreed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  return ctx;
}
