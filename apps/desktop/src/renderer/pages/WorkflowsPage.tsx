/**
 * Visual Workflow Builder Page
 * Drag-and-drop automation workflow creation
 */

import { useState, useCallback, useRef } from 'react';
import {
    Play,
    Pause,
    Plus,
    Trash2,
    Settings,
    Zap,
    Clock,
    Target,
    Bell,
    Mail,
    MessageSquare,
    CheckSquare,
    Calendar,
    GitBranch,
    ArrowRight,
    Save,
    FileText,
    Layers,
    Copy,
    MoreVertical,
    ChevronDown,
    Activity,
    Timer,
    Slack,
    Send,
    Filter
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface WorkflowNode {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'delay';
    category: string;
    title: string;
    description: string;
    icon: string;
    config: Record<string, unknown>;
    position: { x: number; y: number };
    connections: string[]; // IDs of connected nodes
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    nodes: WorkflowNode[];
    createdAt: string;
    updatedAt: string;
    runCount: number;
    lastRunAt: string | null;
}

interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: Omit<WorkflowNode, 'id'>[];
}

// ============================================
// NODE DEFINITIONS
// ============================================

const TRIGGER_NODES = [
    { type: 'trigger', category: 'time', title: 'Scheduled', description: 'Run at specific times', icon: 'Clock' },
    { type: 'trigger', category: 'task', title: 'Task Completed', description: 'When a task is completed', icon: 'CheckSquare' },
    { type: 'trigger', category: 'focus', title: 'Focus Session End', description: 'When focus session ends', icon: 'Timer' },
    { type: 'trigger', category: 'goal', title: 'Goal Achieved', description: 'When a goal is reached', icon: 'Target' },
    { type: 'trigger', category: 'streak', title: 'Streak Milestone', description: 'Streak reaches milestone', icon: 'Activity' },
];

const ACTION_NODES = [
    { type: 'action', category: 'notification', title: 'Send Notification', description: 'Show desktop notification', icon: 'Bell' },
    { type: 'action', category: 'email', title: 'Send Email', description: 'Send email via integration', icon: 'Mail' },
    { type: 'action', category: 'slack', title: 'Post to Slack', description: 'Send Slack message', icon: 'MessageSquare' },
    { type: 'action', category: 'task', title: 'Create Task', description: 'Create a new task', icon: 'CheckSquare' },
    { type: 'action', category: 'calendar', title: 'Create Event', description: 'Add calendar event', icon: 'Calendar' },
    { type: 'action', category: 'webhook', title: 'Send Webhook', description: 'HTTP request to URL', icon: 'Send' },
];

const CONDITION_NODES = [
    { type: 'condition', category: 'filter', title: 'If/Else', description: 'Branch based on condition', icon: 'GitBranch' },
    { type: 'condition', category: 'filter', title: 'Filter', description: 'Filter by criteria', icon: 'Filter' },
];

const DELAY_NODES = [
    { type: 'delay', category: 'time', title: 'Wait', description: 'Wait before continuing', icon: 'Clock' },
];

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'daily-summary',
        name: 'Daily Summary',
        description: 'Send daily productivity summary',
        category: 'productivity',
        nodes: [
            { type: 'trigger', category: 'time', title: 'Daily at 6 PM', description: 'Every day at 6 PM', icon: 'Clock', config: { time: '18:00' }, position: { x: 100, y: 100 }, connections: ['action-1'] },
            { type: 'action', category: 'notification', title: 'Show Summary', description: 'Display daily stats', icon: 'Bell', config: {}, position: { x: 400, y: 100 }, connections: [] },
        ],
    },
    {
        id: 'goal-celebration',
        name: 'Goal Celebration',
        description: 'Celebrate when goals are achieved',
        category: 'motivation',
        nodes: [
            { type: 'trigger', category: 'goal', title: 'Goal Achieved', description: 'When any goal is completed', icon: 'Target', config: {}, position: { x: 100, y: 100 }, connections: ['action-1'] },
            { type: 'action', category: 'notification', title: 'Celebrate!', description: 'Show celebration', icon: 'Bell', config: { sound: true }, position: { x: 400, y: 100 }, connections: [] },
        ],
    },
    {
        id: 'focus-slack',
        name: 'Focus Mode Slack',
        description: 'Post to Slack when focus session ends',
        category: 'integration',
        nodes: [
            { type: 'trigger', category: 'focus', title: 'Focus Session End', description: 'When session completes', icon: 'Timer', config: {}, position: { x: 100, y: 100 }, connections: ['action-1'] },
            { type: 'condition', category: 'filter', title: 'If > 25 min', description: 'Only if long session', icon: 'GitBranch', config: { min: 25 }, position: { x: 300, y: 100 }, connections: ['action-1'] },
            { type: 'action', category: 'slack', title: 'Post Update', description: 'Share focus achievement', icon: 'MessageSquare', config: {}, position: { x: 500, y: 100 }, connections: [] },
        ],
    },
];

// ============================================
// ICON COMPONENT
// ============================================

function NodeIcon({ name, className }: { name: string; className?: string }) {
    const icons: Record<string, React.ReactNode> = {
        Clock: <Clock className={className} />,
        CheckSquare: <CheckSquare className={className} />,
        Timer: <Timer className={className} />,
        Target: <Target className={className} />,
        Activity: <Activity className={className} />,
        Bell: <Bell className={className} />,
        Mail: <Mail className={className} />,
        MessageSquare: <MessageSquare className={className} />,
        Calendar: <Calendar className={className} />,
        Send: <Send className={className} />,
        GitBranch: <GitBranch className={className} />,
        Filter: <Filter className={className} />,
    };
    return <>{icons[name] || <Zap className={className} />}</>;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([
        {
            id: '1',
            name: 'Daily Summary',
            description: 'Send productivity summary every evening',
            isActive: true,
            nodes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            runCount: 45,
            lastRunAt: new Date().toISOString(),
        },
        {
            id: '2',
            name: 'Goal Celebration',
            description: 'Celebrate when goals are achieved',
            isActive: true,
            nodes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            runCount: 12,
            lastRunAt: new Date(Date.now() - 86400000).toISOString(),
        },
    ]);

    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showNodePalette, setShowNodePalette] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const createWorkflow = (template?: WorkflowTemplate) => {
        const newWorkflow: Workflow = {
            id: `wf-${Date.now()}`,
            name: template?.name || 'New Workflow',
            description: template?.description || '',
            isActive: false,
            nodes: template?.nodes.map((n, i) => ({ ...n, id: `node-${i}` })) || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            runCount: 0,
            lastRunAt: null,
        };
        setWorkflows([...workflows, newWorkflow]);
        setSelectedWorkflow(newWorkflow);
        setIsEditing(true);
        setShowTemplates(false);
    };

    const toggleWorkflow = (id: string) => {
        setWorkflows(workflows.map(w =>
            w.id === id ? { ...w, isActive: !w.isActive } : w
        ));
    };

    const deleteWorkflow = (id: string) => {
        setWorkflows(workflows.filter(w => w.id !== id));
        if (selectedWorkflow?.id === id) {
            setSelectedWorkflow(null);
            setIsEditing(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        Workflow Automation
                    </h1>
                    <p className="text-dark-400 mt-2">Create automated workflows to boost your productivity</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-dark-300 hover:text-white hover:border-dark-600 transition-colors"
                    >
                        <Layers className="w-4 h-4" />
                        Templates
                    </button>
                    <button
                        onClick={() => createWorkflow()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Workflow
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Workflow List */}
                <div className="col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Your Workflows</h2>

                    {workflows.length === 0 ? (
                        <div className="p-8 bg-dark-800 border border-dark-700 rounded-2xl text-center">
                            <div className="p-4 rounded-full bg-dark-700 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-dark-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No workflows yet</h3>
                            <p className="text-dark-400 text-sm mb-4">Create your first automation</p>
                            <button
                                onClick={() => setShowTemplates(true)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm"
                            >
                                Browse Templates
                            </button>
                        </div>
                    ) : (
                        workflows.map(workflow => (
                            <div
                                key={workflow.id}
                                onClick={() => setSelectedWorkflow(workflow)}
                                className={`p-4 bg-dark-800 border rounded-xl cursor-pointer transition-all duration-200 hover:border-primary-500/50 ${selectedWorkflow?.id === workflow.id
                                        ? 'border-primary-500 ring-1 ring-primary-500/20'
                                        : 'border-dark-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${workflow.isActive ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                                            <Zap className={`w-4 h-4 ${workflow.isActive ? 'text-green-400' : 'text-dark-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{workflow.name}</h3>
                                            <p className="text-xs text-dark-400">{workflow.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWorkflow(workflow.id);
                                        }}
                                        className={`p-1.5 rounded-lg transition-colors ${workflow.isActive
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-dark-700 text-dark-500'
                                            }`}
                                    >
                                        {workflow.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-xs text-dark-500">
                                    <span>Runs: {workflow.runCount}</span>
                                    <span>
                                        {workflow.lastRunAt
                                            ? `Last: ${new Date(workflow.lastRunAt).toLocaleDateString()}`
                                            : 'Never run'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Workflow Canvas */}
                <div className="col-span-2">
                    {selectedWorkflow ? (
                        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
                            {/* Canvas Header */}
                            <div className="flex items-center justify-between p-4 border-b border-dark-700">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{selectedWorkflow.name}</h3>
                                    <p className="text-sm text-dark-400">{selectedWorkflow.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="px-3 py-1.5 bg-dark-700 text-dark-300 rounded-lg text-sm hover:bg-dark-600 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteWorkflow(selectedWorkflow.id)}
                                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="px-4 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div
                                ref={canvasRef}
                                className="relative h-[500px] bg-dark-900/50 overflow-auto"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                            >
                                {/* Node Palette Button */}
                                <button
                                    onClick={() => setShowNodePalette(!showNodePalette)}
                                    className="absolute top-4 left-4 z-10 px-3 py-2 bg-dark-800 border border-dark-600 rounded-xl text-white hover:bg-dark-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Node
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showNodePalette ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Node Palette Dropdown */}
                                {showNodePalette && (
                                    <div className="absolute top-14 left-4 z-20 w-72 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden">
                                        <div className="p-3 border-b border-dark-700">
                                            <h4 className="text-sm font-medium text-white">Triggers</h4>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {TRIGGER_NODES.map((node, i) => (
                                                <button
                                                    key={i}
                                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700 transition-colors text-left"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                                                        <NodeIcon name={node.icon} className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white">{node.title}</div>
                                                        <div className="text-xs text-dark-400">{node.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="p-3 border-t border-dark-700">
                                            <h4 className="text-sm font-medium text-white">Actions</h4>
                                        </div>
                                        <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
                                            {ACTION_NODES.slice(0, 4).map((node, i) => (
                                                <button
                                                    key={i}
                                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700 transition-colors text-left"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-green-500/20">
                                                        <NodeIcon name={node.icon} className="w-4 h-4 text-green-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white">{node.title}</div>
                                                        <div className="text-xs text-dark-400">{node.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {selectedWorkflow.nodes.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="p-4 rounded-2xl bg-dark-800 border border-dashed border-dark-600 mb-4 inline-block">
                                                <Zap className="w-8 h-8 text-dark-500" />
                                            </div>
                                            <h4 className="text-lg font-medium text-white mb-2">Start building</h4>
                                            <p className="text-dark-400 text-sm mb-4">Add a trigger to start your workflow</p>
                                            <button
                                                onClick={() => setShowNodePalette(true)}
                                                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm"
                                            >
                                                Add First Node
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-dark-800 border border-dark-700 rounded-2xl">
                            <div className="text-center p-8">
                                <Zap className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">Select a workflow</h3>
                                <p className="text-dark-400 text-sm">Choose a workflow to view or edit</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Templates Modal */}
            {showTemplates && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl w-[600px] max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white">Workflow Templates</h2>
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                            {WORKFLOW_TEMPLATES.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => createWorkflow(template)}
                                    className="p-4 bg-dark-900 border border-dark-700 rounded-xl hover:border-primary-500/50 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20">
                                            <Zap className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white">{template.name}</h3>
                                            <p className="text-sm text-dark-400">{template.description}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-dark-500">
                                            <Layers className="w-4 h-4" />
                                            {template.nodes.length} nodes
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-dark-700">
                            <button
                                onClick={() => createWorkflow()}
                                className="w-full py-3 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-colors"
                            >
                                Start from Scratch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
