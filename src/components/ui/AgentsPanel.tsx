import React from 'react';
import type { Agent } from '../../types';

interface AgentsPanelProps {
  agents: Agent[];
}

export const AgentsPanel: React.FC<AgentsPanelProps> = ({ agents }) => {
  const teamAgents = agents.filter(a => a.id !== 'ceo');

  return (
    <div className="agents-panel">
      <h3>Team</h3>
      <div className="agents-grid">
        {teamAgents.map(agent => (
          <div key={agent.id} className={`agent-mini-desk ${agent.isWorking ? 'working' : ''}`}>
            <div className="mini-desk">
              <div className="mini-monitor"></div>
              <div 
                className="mini-status" 
                style={{ background: agent.isWorking ? '#1dd1a1' : '#666' }}
              />
            </div>
            <div className="agent-info">
              <span className="agent-initials">
                {agent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
              <span className="agent-name-short">{agent.name.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
