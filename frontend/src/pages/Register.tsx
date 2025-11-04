/**
 * 注册页面
 */
import { useState, FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';

export function Register() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 如果已登录,重定向到首页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 加载中
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading size="lg" text="加载中..." />
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setSubmitting(true);

    try {
      const result = await register({ username, email, password });
      if (!result.success) {
        setError(result.error || '注册失败');
      }
    } catch (err) {
      setError('注册失败,请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
            注册
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="用户名"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              disabled={submitting}
            />

            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
              disabled={submitting}
            />

            <Input
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码(至少6位)"
              required
              disabled={submitting}
            />

            <Input
              label="确认密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              required
              disabled={submitting}
            />

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={submitting}
            >
              注册
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            已有账号?{' '}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
