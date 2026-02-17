import React from 'react';

interface RulesPanelProps {
  rulesCount: number;
  rulesPreview: string[];
  onEditRules: () => void;
}

export const RulesPanel: React.FC<RulesPanelProps> = ({ rulesCount, rulesPreview, onEditRules }) => {
  return (
    <div className="rules-panel" onClick={onEditRules}>
      <h3>Rules</h3>
      <div className="rules-count">{rulesCount} active</div>
      <div className="rules-preview">
        {rulesPreview.slice(0, 3).map((rule, i) => (
          <div key={i} className="rule-item">• {rule.substring(0, 40)}{rule.length > 40 ? '...' : ''}</div>
        ))}
        {rulesPreview.length === 0 && (
          <div className="rule-item empty">No rules set</div>
        )}
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#888', textAlign: 'center' }}>
        Click to edit
      </div>
    </div>
  );
};
