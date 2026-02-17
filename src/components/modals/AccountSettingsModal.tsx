import React from 'react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Account Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>Display Name</label>
          <input
            type="text"
            defaultValue="You"
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>Timezone</label>
          <select style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', borderRadius: '6px', color: '#fff' }}>
            <option>UTC</option>
            <option>GMT+8 (Asia/Shanghai)</option>
            <option>GMT+0 (London)</option>
            <option>GMT-5 (New York)</option>
            <option>GMT-8 (Los Angeles)</option>
          </select>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: '20px', marginTop: '20px' }}>
          <button
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #ff6b6b',
              borderRadius: '6px',
              color: '#ff6b6b',
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>

        <div className="form-buttons" style={{ marginTop: '20px' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
