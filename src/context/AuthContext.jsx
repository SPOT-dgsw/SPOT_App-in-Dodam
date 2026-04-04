import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useBridgeProvider, useBridgeResponse, Actions } from '@b1nd/aid-kit/bridge-kit/web';
import api, { setDodamToken } from '../api/client';

const AuthContext = createContext(null);
const AUTH_POLL_INTERVAL_MS = 60000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dodamToken, setDodamTokenState] = useState(null);
  const { send } = useBridgeProvider();

  // 도담 OAuth 토큰 응답 처리
  useBridgeResponse(Actions.OAUTH_GET_TOKEN, async (data) => {
    const { token } = data;
    if (token) {
      setDodamTokenState(token);
      setDodamToken(token); // API 클라이언트에도 토큰 설정
      // 토큰을 서버에 전송하여 사용자 정보 조회
      try {
        const res = await api.post('/auth/dodam', { token });
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
    return {};
  });

  const fetchUser = useCallback(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // 도담 앱 환경에서는 브릿지로 토큰 요청
    const isAppInDodam = new URLSearchParams(window.location.search).has('top');
    
    if (isAppInDodam) {
      // 도담 OAuth 토큰 요청
      send(Actions.OAUTH_GET_TOKEN);
    } else {
      // 웹 환경에서는 기존 세션 기반 인증
      fetchUser();
    }

    // 주기적 세션 갱신 및 포커스 복귀 시 즉시 갱신
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isAppInDodam) {
        fetchUser();
      }
    }, AUTH_POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isAppInDodam) {
          send(Actions.OAUTH_GET_TOKEN);
        } else {
          fetchUser();
        }
      }
    };

    const handleFocus = () => {
      if (isAppInDodam) {
        send(Actions.OAUTH_GET_TOKEN);
      } else {
        fetchUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUser, send]);

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setDodamTokenState(null);
    setDodamToken(null); // API 클라이언트 토큰도 제거
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, dodamToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
