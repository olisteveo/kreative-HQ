import React from 'react';

interface CostPanelProps {
  activeTasks: number;
  completedTasks: number;
  totalAgents: number;
  todayApiCost: number;
  dailySubscriptionShare: number;
  onOpenCostDashboard: () => void;
}

export const CostPanel: React.FC<CostPanelProps> = ({
  activeTasks,
  completedTasks,
  totalAgents,
  todayApiCost,
  dailySubscriptionShare,
  onOpenCostDashboard
}) => {
  return (
    <div className="stats-panel" onClick={onOpenCostDashboard} style={{ cursor: 'pointer' }}>
      <h3>Active Tasks: {activeTasks}</h3>
      <h3>Completed: {completedTasks}</h3>
      <h3>Total Agents: {totalAgents}</h3>
      <div className="cost-summary">
        <h3>Today's Cost</h3>
        <div className="cost-amount">${(todayApiCost + dailySubscriptionShare).toFixed(4)}</div>
        <div className="cost-breakdown">
          <span>API: ${todayApiCost.toFixed(4)}</span>
          <span>Subs: ${dailySubscriptionShare.toFixed(2)}/day</span>
        </div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#888', textAlign: 'center' }}>
        Click for cost dashboard
      </div>
    </div>
  );
};
