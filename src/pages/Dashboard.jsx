import React from 'react';
// Import standard Lucide React icons for the StatsCards.
import { Users, Target, DollarSign, Trophy } from 'lucide-react';

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
  const { leads, addLead } = useLeads();

  // ============================================================================
  // Dynamic Metric Calculations (Consuming Global Context State)
  // ============================================================================

  // 1. Total Leads count
  const totalLeads = leads.length;

  // 2. Conversion Rate: (Won Leads / Total Leads) * 100
  const wonLeads = leads.filter(lead => lead.status === 'Won');
  const conversionRate = totalLeads > 0 
    ? ((wonLeads.length / totalLeads) * 100).toFixed(1) 
    : '0.0';

  // 3. Pipeline Value: Sum of deal values for active (non-Won/Lost) leads
  const activeLeads = leads.filter(lead => lead.status !== 'Won' && lead.status !== 'Lost');
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  // 4. Deals Won count
  const dealsWonCount = wonLeads.length;

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
    <div className="space-y-6">
      
      {/* Dashboard Page Title Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Executive Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Welcome back, Sarah. Here is a summary of your startup's sales pipeline performance.
        </p>
      </div>

      {/* Responsive Stats Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Leads */}
        <StatsCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          change="+14.2%"
          color="primary"
        />

        {/* KPI 2: Conversion Rate */}
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Target}
          change="+2.8%"
          color="success"
        />

        {/* KPI 3: Pipeline Value */}
        <StatsCard
          title="Pipeline Value"
          value={formattedPipeline}
          icon={DollarSign}
          change="+8.6%"
          color="warning"
        />

        {/* KPI 4: Deals Won */}
        <StatsCard
          title="Deals Closed / Won"
          value={dealsWonCount}
          icon={Trophy}
          change="+12.0%"
          color="danger"
        />

      </div>

      {/* Secondary Layout Grid (1 Column on Mobile/Tablet, 2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Segmented Pipeline Bar Widget (Chart/Overview) */}
        <PipelineOverview leads={leads} />

        {/* High-density Recent Leads Table View */}
        <RecentLeads leads={leads} />

        {/* Bottom Actions Row - 2 columns on tablet/desktop */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Workspace Action Buttons Panel */}
          <QuickActions 
            onAddLead={handleAddLead}
            onViewAll={handleViewAllLeads}
            onExport={handleExportData}
          />

          {/* Premium Help Card / Quick Tip Panel (Notion-style highlight box) */}
          <div className="p-5 bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/10 dark:border-blue-950/20 rounded-2xl flex flex-col justify-center">
            <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-1.5">
              <span>💡</span> CRM Workspace Tip
            </h4>
            <p className="text-[11px] text-blue-700/90 dark:text-blue-300/80 leading-relaxed">
              Leads are now stored globally in the centralized Context API. Creating, updating, or deleting a lead anywhere in the application will automatically synchronize the changes here and save them in localStorage.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
