import React, { useRef, useEffect, useState, useCallback } from 'react';
import './OfficeCanvas.css';
import { TopNav, SetupModal, AccountSettingsModal } from './';
import { DashboardPanel } from './ui/DashboardPanel';
import { CostPanel } from './ui/CostPanel';
import { RulesPanel } from './ui/RulesPanel';
import { AgentsPanel } from './ui/AgentsPanel';
import type { Zone, Agent, Task, DeskAssignment, Connection } from '../types';
import { calculateDeskLayout, DEFAULT_DESKS, INITIAL_AGENTS, DEFAULT_SUBSCRIPTIONS } from '../utils/constants';

const OfficeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [desks, setDesks] = useState<Zone[]>(DEFAULT_DESKS);
  const [deskAssignments, setDeskAssignments] = useState<DeskAssignment[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLog, setTaskLog] = useState<string[]>(['Welcome to Kreative HQ...']);
  const [todayApiCost] = useState(0);
  const [,] = useState(false); // showWhiteboard placeholder
  const [whiteboardNotes] = useState<Record<string, string[]>>({
    vision: [], goals: [], plans: [], ideas: [], memos: [], rules: []
  });
  const [, setActiveTab] = useState('vision');
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const calculateZones = useCallback((width: number, height: number): Record<string, Zone> => {
    const layout = calculateDeskLayout(desks);
    return layout.reduce((acc, desk) => ({
      ...acc,
      [desk.id!]: { ...desk, x: width * desk.x, y: height * desk.y }
    }), {});
  }, [desks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = Math.max(canvas.offsetHeight, 800);
      dimensionsRef.current = { width: canvas.width, height: canvas.height };
      
      const newZones = calculateZones(canvas.width, canvas.height);
      setAgents(INITIAL_AGENTS.map(agent => ({
        ...agent,
        x: newZones[agent.zone].x,
        y: newZones[agent.zone].y + agent.deskOffset.y
      })));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateZones]);

  const addLogEntry = useCallback((message: string) => {
    setTaskLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 20));
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
    addLogEntry(isPaused ? 'Simulation resumed' : 'Simulation paused');
  };

  const resetOffice = () => {
    const { width, height } = dimensionsRef.current;
    const newZones = calculateZones(width, height);
    setAgents(INITIAL_AGENTS.map(agent => ({
      ...agent,
      x: newZones[agent.zone].x,
      y: newZones[agent.zone].y + agent.deskOffset.y
    })));
    setTasks([]);
    addLogEntry('Office reset');
  };

  const getDailySubscriptionShare = () => {
    return DEFAULT_SUBSCRIPTIONS
      .filter(s => s.active)
      .reduce((total, s) => total + s.monthlyCost, 0) / 30;
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

      <div className="left-sidebar">
        <DashboardPanel 
          taskLog={taskLog} 
          onOpenWhiteboard={() => {}} 
        />
        <CostPanel
          activeTasks={tasks.filter(t => t.status === 'in-progress').length}
          completedTasks={tasks.filter(t => t.status === 'completed').length}
          totalAgents={agents.length}
          todayApiCost={todayApiCost}
          dailySubscriptionShare={getDailySubscriptionShare()}
          onOpenCostDashboard={() => {}}
        />
        <RulesPanel
          rulesCount={whiteboardNotes.rules?.length || 0}
          rulesPreview={whiteboardNotes.rules || []}
          onEditRules={() => { setActiveTab('rules'); }}
        />
      </div>

      <canvas ref={canvasRef} className="office-canvas" />

      <AgentsPanel agents={agents} />

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
