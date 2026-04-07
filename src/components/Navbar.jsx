import { useRouter } from '@b1nd/aid-kit/navigation';
import { useBridgeProvider, Actions } from '@b1nd/aid-kit/bridge-kit/web';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { stack, tab } = useRouter();
  const { send } = useBridgeProvider();
  const isAdmin = user && (user.role === 'MEMBER' || user.role === 'LEADER');
  const isBlocked = user?.is_blacklisted;
  
  // 미니앱 환경 감지
  const isAppInDodam = new URLSearchParams(window.location.search).has('top');

  const handleNavClick = (path) => {
    // 햅틱 피드백
    send(Actions.HAPTIC, { style: 'selection' });
    
    if (path === '/') {
      // 탭으로 이동 (홈)
      if (stack.current.length > 0) {
        stack.pop('/');
      }
      tab.move('/');
    } else {
      // 스택으로 푸시
      stack.push(path);
    }
  };

  const handleBack = () => {
    send(Actions.HAPTIC, { style: 'light' });
    if (stack.current.length > 0) {
      stack.pop();
    } else {
      // 스택이 비어있으면 네이티브 뒤로가기
      send(Actions.NAVIGATION_POP);
    }
  };

  const handleLogout = async () => {
    send(Actions.HAPTIC, { style: 'warning' });
    await logout();
    tab.move('/');
  };

  const currentPath = stack.current[stack.current.length - 1]?.path || tab.current || '/';
  const isActiveClass = (path) => currentPath === path ? 'is-active' : '';

  return (
    <nav className="cu-nav-shell">
      <div className="cu-nav-wrap">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          {/* 스택이 있으면 뒤로가기 버튼 표시 */}
          {stack.current.length > 0 && (
            <button
              onClick={handleBack}
              className="cu-link p-1"
              aria-label="뒤로가기"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <button
            onClick={() => handleNavClick('/')}
            className="inline-flex items-center gap-1 mr-3 sm:mr-5 text-base sm:text-lg font-bold tracking-tight"
          >
            <img src="/spot-logo.svg" alt="SPOT logo" className="w-8 h-8 sm:w-9 sm:h-9" />
            <span>SPOT</span>
          </button>
          
          <button
            onClick={() => handleNavClick('/')}
            className={`hidden sm:block cu-link text-xs sm:text-sm ${isActiveClass('/')}`}
          >
            홈
          </button>
          
          {user && (
            <>
              {!isBlocked && (
                <button
                  onClick={() => handleNavClick('/apply')}
                  className={`cu-link text-xs sm:text-sm ${isActiveClass('/apply')}`}
                >
                  신청
                </button>
              )}
              <button
                onClick={() => handleNavClick('/my')}
                className={`hidden md:block cu-link text-xs sm:text-sm ${isActiveClass('/my')}`}
              >
                마이페이지
              </button>
              <button
                onClick={() => handleNavClick('/my')}
                className={`md:hidden cu-link text-xs sm:text-sm ${isActiveClass('/my')}`}
              >
                MY
              </button>
            </>
          )}
          {isAdmin && !isBlocked && (
            <>
<button
                onClick={() => handleNavClick('/admin')}
                className={`cu-link text-xs sm:text-sm ${isActiveClass('/admin')}`}
              >
                관리
              </button>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={toggle}
            className="cu-btn cu-btn-muted p-1.5 sm:p-2"
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="text-sm hidden sm:inline" style={{ color: 'var(--cu-muted)' }}>
                {user.name}
              </span>
              <button onClick={handleLogout} className="cu-btn cu-btn-danger">
                로그아웃
              </button>
            </div>
          ) : (
            // 미니앱에서는 도담 OAuth를 통해 자동 로그인되므로 로그인 버튼 숨김
            !isAppInDodam && (
              <a href={`${import.meta.env.VITE_API_URL || ''}/auth/dodam`} className="cu-btn cu-btn-primary">
                로그인
              </a>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
