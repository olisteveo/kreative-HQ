import React from 'react';

interface TopNavProps {
  onNewTask: () => void;
  onMeetingRoom: () => void;
  onSetup: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  onAccountSettings: () => void;
  isPaused: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onNewTask,
  onMeetingRoom,
  onSetup,
  onTogglePause,
  onReset,
  onAccountSettings,
  isPaused
}) => {
  return (
    <div className="top-nav">
      <button onClick={onNewTask}>New Task</button>
      <button onClick={onMeetingRoom}>Meeting Room</button>
      <button onClick={onSetup}>Setup</button>
      <button onClick={onTogglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
      <button onClick={onReset}>Reset</button>
      <div className="user-icon" onClick={onAccountSettings} title="Account Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    </div>
  );
};
