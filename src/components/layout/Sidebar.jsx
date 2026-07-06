import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DarkModeToggle from '../common/DarkModeToggle';

/**
 * Sidebar Component
 * 
 * A highly polished, responsive sidebar navigation designed in a premium, 
 * Linear/Notion-inspired style. It adapts to different device form factors:
 * - Mobile: Top header with hamburger toggle + Fixed bottom navigation (icons only) + Slide drawer.
 * - Tablet: Compact left sidebar with icons + text labels (sub-labels hidden).
 * - Desktop: Wide left sidebar with icons, text labels, and sub-labels.
 * 
 * Integrated with ThemeContext and supports touch-friendly 44x44px minimum tap targets.
 */
export default function Sidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Navigation items containing path, label, sub-label, and SVGs
  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      subLabel: 'Overview & Metrics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      )
    },
    {
      path: '/leads',
      label: 'Leads',
      subLabel: 'Manage Prospects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20.8a11.382 11.382 0 0 1-5.09-1.563v-.109m10.089-3.07-.003-.003m-10.089 3.07v-.003c0-1.113.285-2.16.786-3.07M5.009 19.128v.109a11.386 11.386 0 0 0 4.914 1.563 11.386 11.386 0 0 0 4.917-1.563v-.109M9.923 15.75c-2.258 0-4.425.266-6.5.779a4.125 4.125 0 0 0-3.219 4.01V21h19.438v-.46a4.125 4.125 0 0 0-3.218-4.01 6.3 6.3 0 0 0-6.5-.779Zm0-1.125a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm8.25-2.25a2.625 2.625 0 1 0 0-5.25 2.625 2.625 0 0 0 0 5.25Z" />
        </svg>
      )
    },
    {
      path: '/analytics',
      label: 'Analytics',
      subLabel: 'Reports & Trends',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      )
    }
  ];

  const brandLogo = (
    <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-sm animate-pulse flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    </div>
  );

  const brandText = (
    <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
      CRM <span className="text-blue-600 dark:text-blue-400 font-normal text-sm px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50">Lite</span>
    </span>
  );

  return (
    <>
      {/* ───────────────────────────────────────────────────────────────────────
          MOBILE TOP NAVBAR (Hidden on md+)
          ─────────────────────────────────────────────────────────────────────── */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors w-full">
        <div className="flex items-center gap-3">
          {brandLogo}
          {brandText}
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle - ensure 44px tap target on mobile */}
          <div className="w-11 h-11 flex items-center justify-center">
            <DarkModeToggle />
          </div>
          {/* Hamburger button - 44x44px target */}
          <button
            onClick={toggleDrawer}
            aria-label="Open navigation menu"
            className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAV BAR (Hidden on md+)
          ─────────────────────────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 flex md:hidden items-center justify-around px-2 shadow-lg transition-colors">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeDrawer}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer
              ${isActive 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }
            `}
            title={item.label}
          >
            {item.icon}
          </NavLink>
        ))}
        {/* Mobile bottom nav "More" toggle button (44x44px minimum target) */}
        <button
          onClick={toggleDrawer}
          aria-label="Toggle navigation drawer"
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {/* ───────────────────────────────────────────────────────────────────────
          MOBILE DRAWER OVERLAY (Hidden on md+)
          ─────────────────────────────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeDrawer}
          />
          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 shadow-2xl transition-transform duration-300 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
              <div className="flex items-center gap-3">
                {brandLogo}
                {brandText}
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-150 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeDrawer}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer h-12
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-755'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span>{item.label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal mt-0.5 leading-none">
                      {item.subLabel}
                    </span>
                  </div>
                </NavLink>
              ))}
            </nav>

            {/* Drawer Footer controls */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Appearance</span>
                {/* 44x44px responsive wrapper */}
                <div className="w-11 h-11 flex items-center justify-center">
                  <DarkModeToggle />
                </div>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">SC</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">Sarah Chen</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Founder & Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          TABLET & DESKTOP SIDEBAR (Visible on md+)
          ─────────────────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-56 lg:w-72 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 h-screen sticky top-0 flex-shrink-0">
        {/* Sidebar Header: Brand & Logo */}
        <div className="p-5 lg:p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {brandLogo}
            {brandText}
          </div>
          {/* Dark Mode toggle - visible in sidebar header on md+ */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col gap-1 p-3 lg:p-4 w-full flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 whitespace-nowrap w-full
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-950/30' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 border border-transparent dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs lg:text-sm">{item.label}</span>
                {/* subLabel only visible on desktop (lg+), hidden on tablet (md) */}
                <span className="hidden lg:inline-block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none font-normal">
                  {item.subLabel}
                </span>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer: Profile */}
        <div className="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 flex-shrink-0">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">SC</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">Sarah Chen</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Founder & Admin</span>
          </div>
        </div>
      </aside>
    </>
  );
}
