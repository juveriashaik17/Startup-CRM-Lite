import React from 'react';
// Import Link from react-router-dom to support client-side navigation back
// to our primary application routes without incurring a full browser reload.
import { Link } from 'react-router-dom';

/**
 * NotFound Component (404 Error Screen)
 * 
 * Rendered whenever a user requests an invalid or unregistered route.
 * Leverages a premium, centered flex layout, clean vector graphic elements,
 * and clear call-to-action behaviors to guide the user back to safety.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      
      {/* Visual Indicator: Clean, stylized 404 graphic */}
      <div className="relative mb-6">
        {/* Large backdrops simulating depth */}
        <div className="text-9xl font-black tracking-widest text-slate-200/60 dark:text-zinc-800/30 select-none">
          404
        </div>
        
        {/* Absolute-positioned floating graphic emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center shadow-xl backdrop-blur-sm animate-pulse">
            {/* Minimal warning/search icon */}
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Primary Message Header */}
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-2">
        Page not found
      </h1>

      {/* Secondary explanatory description */}
      <p className="text-sm lg:text-base text-slate-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
        The link you followed might be broken, or the page may have been moved or deleted. Double check the address or return home.
      </p>

      {/* Direct actions block */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        
        {/* Primary CTA button navigating back to Dashboard */}
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 shadow-lg shadow-blue-500/15 dark:shadow-none transition-all duration-150"
        >
          {/* Arrow-left icon */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Secondary support/contact button */}
        <a
          href="mailto:support@crmlite.com"
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-150"
        >
          Contact Support
        </a>

      </div>

    </div>
  );
}
