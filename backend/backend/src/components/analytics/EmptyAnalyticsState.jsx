import React from 'react';
import { BarChart3, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * EmptyAnalyticsState
 * Shown when the lead database is empty. Displays a friendly zero-state
 * with an icon, headline, description, and an Add Lead CTA.
 */
export default function EmptyAnalyticsState({ onAddLead }) {
  const navigate = useNavigate();

  const handleAddLead = () => {
    if (typeof onAddLead === 'function') {
      onAddLead();
    } else {
      navigate('/leads');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      {/* Icon container */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-inner">
          <BarChart3 className="w-10 h-10 text-slate-400 dark:text-zinc-500" />
        </div>
        {/* Decorative ping ring */}
        <div className="absolute -inset-3 rounded-3xl border border-slate-200/60 dark:border-zinc-700/40 animate-ping opacity-20" />
      </div>

      {/* Headline */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-3">
        No analytics available yet
      </h3>

      {/* Subtext */}
      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-8">
        Add your first lead to start tracking business performance.
      </p>

      {/* CTA */}
      <button
        onClick={handleAddLead}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-150 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Lead
      </button>

      {/* Decorative grid */}
      <div className="mt-12 grid grid-cols-3 gap-3 opacity-30 pointer-events-none select-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-200 dark:bg-zinc-800"
            style={{ opacity: 1 - i * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}
