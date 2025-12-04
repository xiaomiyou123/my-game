import { useState, useEffect, useCallback } from 'react';

export interface AIAction {
    id: string;
    timestamp: Date;
    action: string;
    module: 'weather' | 'crop' | 'device' | 'system';
    status: 'success' | 'warning' | 'error';
}

export interface ModuleConnection {
    moduleId: string;
    moduleName: string;
    isActive: boolean;
    lastSync: Date;
}

export interface AIControlState {
    isAutonomous: boolean;
    activityLog: AIAction[];
    connections: ModuleConnection[];
    aiStatus: 'idle' | 'analyzing' | 'acting' | 'monitoring';
    decisionsToday: number;
    energySaved: number;
    yieldOptimization: number;
}

const initialState: AIControlState = {
    isAutonomous: true,
    activityLog: [],
    connections: [
        { moduleId: 'weather', moduleName: 'Weather Monitor', isActive: true, lastSync: new Date() },
        { moduleId: 'crop', moduleName: 'Crop Health', isActive: true, lastSync: new Date() },
        { moduleId: 'device', moduleName: 'Device Control', isActive: true, lastSync: new Date() },
    ],
    aiStatus: 'monitoring',
    decisionsToday: 247,
    energySaved: 18.5,
    yieldOptimization: 12.3,
};

export const useAIControl = () => {
    const [state, setState] = useState<AIControlState>(initialState);

    const addAction = useCallback((action: Omit<AIAction, 'id' | 'timestamp'>) => {
        const newAction: AIAction = {
            ...action,
            id: Date.now().toString(),
            timestamp: new Date(),
        };

        setState(prev => ({
            ...prev,
            activityLog: [newAction, ...prev.activityLog].slice(0, 50), // Keep last 50 actions
            decisionsToday: prev.decisionsToday + 1,
        }));
    }, []);

    const toggleAutonomous = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAutonomous: !prev.isAutonomous,
        }));
    }, []);

    const updateConnectionStatus = useCallback((moduleId: string, isActive: boolean) => {
        setState(prev => ({
            ...prev,
            connections: prev.connections.map(conn =>
                conn.moduleId === moduleId
                    ? { ...conn, isActive, lastSync: new Date() }
                    : conn
            ),
        }));
    }, []);

    const setAIStatus = useCallback((status: AIControlState['aiStatus']) => {
        setState(prev => ({ ...prev, aiStatus: status }));
    }, []);

    // Simulate AI activity
    useEffect(() => {
        if (!state.isAutonomous) return;

        const actions = [
            { action: 'Adjusted irrigation levels in Zone B based on soil moisture data', module: 'device' as const, status: 'success' as const },
            { action: 'Detected optimal temperature for greenhouse ventilation', module: 'weather' as const, status: 'success' as const },
            { action: 'Identified early pest indicators in Area C - deploying countermeasures', module: 'crop' as const, status: 'warning' as const },
            { action: 'Optimized energy consumption for irrigation pumps - 3.2% savings', module: 'device' as const, status: 'success' as const },
            { action: 'Weather pattern suggests rain in 6 hours - pausing irrigation schedule', module: 'weather' as const, status: 'success' as const },
            { action: 'Crop growth rate exceeding target by 8% - maintaining current protocol', module: 'crop' as const, status: 'success' as const },
            { action: 'Drone patrol completed - no anomalies detected', module: 'device' as const, status: 'success' as const },
        ];

        const interval = setInterval(() => {
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            addAction(randomAction);

            // Randomly update connection activity
            const moduleId = randomAction.module === 'device' ? 'device' : randomAction.module === 'weather' ? 'weather' : 'crop';
            updateConnectionStatus(moduleId, true);

            // Set status to acting briefly
            setAIStatus('acting');
            setTimeout(() => setAIStatus('monitoring'), 2000);

            // Deactivate connection after a moment
            setTimeout(() => {
                updateConnectionStatus(moduleId, false);
            }, 3000);
        }, 8000); // Action every 8 seconds

        return () => clearInterval(interval);
    }, [state.isAutonomous, addAction, updateConnectionStatus, setAIStatus]);

    return {
        ...state,
        addAction,
        toggleAutonomous,
        updateConnectionStatus,
        setAIStatus,
    };
};
