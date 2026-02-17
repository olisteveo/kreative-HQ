import React, { useRef, useEffect, useState, useCallback } from 'react';
import './OfficeCanvas.css';
import { TopNav, SetupModal, AccountSettingsModal } from './';
import type { Zone, DeskAssignment, Connection } from '../types';
import { calculateDeskLayout, DEFAULT_DESKS, INITIAL_AGENTS } from '../utils/constants';

const OfficeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [desks, setDesks] = useState<Zone[]>(DEFAULT_DESKS);
  const [deskAssignments, setDeskAssignments] = useState<DeskAssignment[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const calculateZones = useCallback((width: number, height: number): Record<string, Zone> => {
    const layout = calculateDeskLayout(desks);
    return layout.reduce((acc, desk) => ({
      ...acc,
      [desk.id!]: {
        ...desk,
        x: width * desk.x,
        y: height * desk.y
      }
    }), {});
  }, [desks]);

  const resetAgents = useCallback((width: number, height: number) => {
    const zones = calculateZones(width, height);
    return INITIAL_AGENTS.map(agent => ({
      ...agent,
      x: zones[agent.zone].x + agent.deskOffset.x,
      y: zones[agent.zone].y + agent.deskOffset.y
    }));
  }, [calculateZones]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      dimensionsRef.current = { width: canvas.width, height: canvas.height };
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [resetAgents]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetOffice = () => {
    const { width, height } = dimensionsRef.current;
    resetAgents(width, height);
  };

  return (
    <div className="office-canvas-container">
      <TopNav
        onNewTask={() => {}}
        onMeetingRoom={() => {}}
        onSetup={() => setShowSettings(true)}
        onTogglePause={togglePause}
        onReset={resetOffice}
        onAccountSettings={() => setShowAccountSettings(true)}
        isPaused={isPaused}
      />

      <canvas ref={canvasRef} className="office-canvas" />

      <SetupModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        desks={desks}
        setDesks={setDesks}
        deskAssignments={deskAssignments}
        setDeskAssignments={setDeskAssignments}
        connections={connections}
        setConnections={setConnections}
      />

      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </div>
  );
};

export default OfficeCanvas;
