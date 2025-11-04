/**
 * 布局组件
 */
import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {showHeader && <Header />}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
