import { lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Apply = lazy(() => import('./pages/Apply'));
const Admin = lazy(() => import('./pages/Admin'));
const MyPage = lazy(() => import('./pages/MyPage'));
const Approvals = lazy(() => import('./pages/Approvals'));

export const routes = {
  tabs: [
    { path: '/', index: true, element: Home },
  ],
  stacks: [
    { path: '/apply', element: Apply },
    { path: '/my', element: MyPage },
    { path: '/approvals', element: Approvals },
    { path: '/admin', element: Admin },
  ],
};
