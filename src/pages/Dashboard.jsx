import React, { useEffect } from 'react';
// Import standard Lucide React icons for the StatsCards.
import { Users, Target, DollarSign, Trophy, Clock, XCircle } from 'lucide-react';
import { getAverageSalesCycle, getLostRate } from '../utils/analyticsHelpers';

// Import our custom global useLeads hook
import { useLeads } from '../context/LeadContext';

// Import our modular dashboard components
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';

/**
 * Dashboard Page Component
 * 
 * The primary dashboard view for Startup CRM Lite.
 * Consumes lead records from the global LeadContext via the useLeads hook,
 * dynamically computes workspace metrics, and coordinates layout components.
 * 
 * @returns {React.JSX.Element} The fully assembled CRM dashboard.
 */
export default function Dashboard() {
  // Consume leads and addLead method from the centralized context
  const { leads, addLead, fetchLeads } = useLeads();

  // Fetch leads on component mount to sync dashboard KPIs with database
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ============================================================================
  // Dynamic Metric Calculations (Consuming Global Context State)
  // ============================================================================

  const safeLeads = Array.isArray(leads) ? leads : [];

  // 1. Total Leads count
  const totalLeads = safeLeads.length;

  // 2. Conversion Rate: (Won Leads / Total Leads) * 100
  const wonLeads = safeLeads.filter(lead => lead?.status === 'Won');
  const conversionRate = totalLeads > 0 
    ? ((wonLeads.length / totalLeads) * 100).toFixed(1) 
    : '0.0';

  // 3. Pipeline Value: Sum of deal values for active (non-Won/Lost) leads
  const activeLeads = safeLeads.filter(lead => lead?.status !== 'Won' && lead?.status !== 'Lost');
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + (lead?.value || 0), 0);

  // 4. Deals Won count
  const dealsWonCount = wonLeads.length;

  // 5. Avg Sales Cycle (days from creation to Won)
  const avgSalesCycle = getAverageSalesCycle(safeLeads);

  // 6. Lost Rate (% of leads with Lost status)
  const lostRate = getLostRate(safeLeads);

  // Format active pipeline currency value for clean SaaS presentation (e.g. $239,200)
  const formattedPipeline = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(pipelineValue);

  /**
   * Action handler to generate a simulated demo lead.
   * Compiles the new lead details payload and registers it globally via the addLead hook.
   * Unique IDs and createdAt ISO timestamps are appended automatically by the provider.
   */
  const handleAddLead = () => {
    const newIndex = totalLeads + 1;
    
    // Compile details payload (omitting id and createdAt, as they are stamped by the provider)
    const demoLeadPayload = {
      name: `Demo Prospect ${newIndex}`,
      company: `Startup ${newIndex}`,
      email: `contact@startup${newIndex}.io`,
      phone: `+1 (555) 019-${1000 + newIndex}`,
      value: Math.floor(Math.random() * 50000) + 5000,
      status: 'New', // Initial status stage
      source: 'LinkedIn'
    };

    addLead(demoLeadPayload);
  };

  /**
   * Action handler to trigger data export logs.
   */
  const handleExportData = () => {
    console.table(leads);
    alert(`CSV Export triggered! Exported ${leads.length} active records to console logs.`);
  };

  /**
   * Action handler to alert navigation redirects.
   */
  const handleViewAllLeads = () => {
    alert('Redirecting to the complete Leads Management Page. Please use the "Leads" tab in the sidebar navigation.');
  };

  return (
    <div className="space-y-8 pb-4">
      
      {/* Dashboard Page Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Overview of your startup's sales pipeline health and revenue performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddLead}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            + Quick Add Lead
          </button>
        </div>
      </div>

      {/* Responsive 3x2 Executive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* KPI 1: Total Leads */}
        <StatsCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          change="+14.2%"
          color="primary"
        />

        {/* KPI 2: Pipeline Value */}
        <StatsCard
          title="Pipeline Value"
          value={formattedPipeline}
          icon={DollarSign}
          change="+8.6%"
          color="warning"
        />

        {/* KPI 3: Deals Won */}
        <StatsCard
          title="Deals Won"
          value={dealsWonCount}
          icon={Trophy}
          change="+12.0%"
          color="success"
        />

        {/* KPI 4: Conversion Rate */}
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Target}
          change="+2.8%"
          color="success"
        />

        {/* KPI 5: Avg Sales Cycle */}
        <StatsCard
          title="Avg Sales Cycle"
          value={avgSalesCycle > 0 ? `${avgSalesCycle} Days` : '0 Days'}
          icon={Clock}
          change="-3.2%"
          color="warning"
        />

        {/* KPI 6: Lost Rate */}
        <StatsCard
          title="Lost Rate"
          value={`${lostRate}%`}
          icon={XCircle}
          change="-1.5%"
          color="danger"
        />

      </div>

      {/* Visual Workspace Analytics: Pipeline Overview (1 Col) + Recent Leads (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Segmented Pipeline Bar Widget */}
        <div className="lg:col-span-1">
          <PipelineOverview leads={leads} />
        </div>

        {/* High-density Recent Leads Table View */}
        <div className="lg:col-span-2">
          <RecentLeads leads={leads} />
        </div>

      </div>

      {/* Bottom Operations & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Operations Action Panel (1 Col) */}
        <div className="lg:col-span-1">
          <QuickActions 
            onAddLead={handleAddLead}
            onViewAll={handleViewAllLeads}
            onExport={handleExportData}
          />
        </div>

        {/* Workspace Quick Insights & Summary (2 Cols) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Pipeline Health & Conversion Insights
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time indicators derived from your active lead flow.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                Active Cycle
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                  Active Prospects
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                  {activeLeads.length} Deals
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1">
                  Moving through funnel
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                  Win / Loss Ratio
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {dealsWonCount}W : {safeLeads.filter(l => l?.status === 'Lost').length}L
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1">
                  Closed deals breakdown
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                  Avg Deal Value
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                  {totalLeads > 0 
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(pipelineValue / Math.max(1, activeLeads.length)))
                    : '$0'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1">
                  Per active prospect
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>For deeper cohort analytics, funnel metrics, and velocity charts:</span>
            <a href="/analytics" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              Open Analytics Dashboard &rarr;
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
