import React from 'react';

interface DashboardPanelProps {
  taskLog: string[];
  onOpenWhiteboard: () => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ taskLog, onOpenWhiteboard }) => {
  return (
    <div className="ui-panel" onClick={onOpenWhiteboard} style={{ cursor: 'pointer' }}>
      <h1>Kreative</h1>
      <p>AI Agency Dashboard</p>
      <div className="task-log">
        {taskLog.map((entry, i) => (
          <div key={i} className="task-entry">{entry}</div>
        ))}
      </div>
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
        Click to open whiteboard
      </div>
    </div>
  );
};
