import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import Header from '@/components/layout/Header';
import { ApiError } from '@/shared/api/client';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockUseAuth = vi.fn();
const mockLogoutUser = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/modules/auth/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/modules/auth/api/authApi', () => ({
  logoutUser: () => mockLogoutUser(),
}));

describe('Header', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('로그인하지 않은 경우, "로그인" 버튼을 보여준다', () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      logout: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('로그인한 경우, "로그아웃" 버튼을 보여준다', () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      logout: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('로그인하지 않은 경우, 로그인 버튼 클릭 시 /login 으로 이동한다', async () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      logout: vi.fn(),
    });

    render(<Header />);

    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('로그인한 경우, 로그아웃 버튼 클릭 시 logout 호출 후 /로 이동한다', async () => {
    const logoutMock = vi.fn();
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      logout: logoutMock,
    });

    mockLogoutUser.mockResolvedValue(undefined);

    render(<Header />);

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('로그인한 경우, 로그아웃 요청이 실패하면 에러 로그를 출력하고 이동하지 않는다', async () => {
    const logoutMock = vi.fn();
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      logout: logoutMock,
    });

    mockLogoutUser.mockRejectedValue(new ApiError('로그아웃 실패', 500));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Header />);

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('로그아웃 실패');
    });

    expect(logoutMock).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('로그인한 경우, 로그아웃 요청 중 에러가 발생하면 에러 로그를 출력한다', async () => {
    const logoutMock = vi.fn();
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      logout: logoutMock,
    });

    const error = new Error('network error');
    mockLogoutUser.mockRejectedValue(error);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Header />);

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    expect(logoutMock).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('헤더 타이틀 링크가 / 로 이동하도록 렌더링된다', () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      logout: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole('link', { name: 'Screen Reader Studio' })).toHaveAttribute('href', '/');
  });
});
