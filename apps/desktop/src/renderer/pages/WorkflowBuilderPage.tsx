import { useState } from 'react';
import {
    GitBranch, Play, Pause, Plus, Trash2, Settings,
    Zap, Clock, Bell, Calendar, CheckCircle2, Mail,
    Slack, Save, Copy, Upload, ArrowRight, Edit
} from 'lucide-react';

// Workflow types
interface WorkflowNode {
    id: string;
    type: 'trigger' | 'action' | 'condition';
    name: string;
    config: Record<string, unknown>;
    position: { x: number; y: number };
}

interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    condition?: string;
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    enabled: boolean;
    lastRun?: string;
    runCount: number;
}

// Available triggers
const TRIGGERS = [
    { id: 'focus_start', name: 'Focus Session Started', icon: Play, color: '#22c55e' },
    { id: 'focus_end', name: 'Focus Session Ended', icon: Pause, color: '#ef4444' },
    { id: 'task_complete', name: 'Task Completed', icon: CheckCircle2, color: '#3b82f6' },
    { id: 'time_trigger', name: 'At Scheduled Time', icon: Clock, color: '#f59e0b' },
    { id: 'streak_milestone', name: 'Streak Milestone', icon: Zap, color: '#8b5cf6' },
];

// Available actions
const ACTIONS = [
    { id: 'send_notification', name: 'Send Notification', icon: Bell, color: '#3b82f6' },
    { id: 'create_task', name: 'Create Task', icon: Plus, color: '#22c55e' },
    { id: 'send_slack', name: 'Send Slack Message', icon: Slack, color: '#e11d48' },
    { id: 'send_email', name: 'Send Email', icon: Mail, color: '#f59e0b' },
    { id: 'block_calendar', name: 'Block Calendar', icon: Calendar, color: '#8b5cf6' },
    { id: 'start_focus', name: 'Start Focus Session', icon: Play, color: '#22c55e' },
];

// Workflow templates
const TEMPLATES = [
    {
        id: 'daily-standup',
        name: 'Daily Standup',
        description: 'Get reminded for daily standup every weekday',
        nodes: 2,
        icon: Calendar
    },
    {
        id: 'focus-complete',
        name: 'Focus Celebration',
        description: 'Send Slack message when focus session completes',
        nodes: 3,
        icon: Slack
    },
    {
        id: 'streak-reward',
        name: 'Streak Reward',
        description: 'Create reward task when hitting streak milestones',
        nodes: 3,
        icon: Zap
    },
];

export default function WorkflowBuilderPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([
        {
            id: '1',
            name: 'Focus Completion Notification',
            description: 'Notify me when a focus session ends',
            nodes: [
                { id: 'n1', type: 'trigger', name: 'Focus Session Ended', config: {}, position: { x: 100, y: 150 } },
                { id: 'n2', type: 'action', name: 'Send Notification', config: { message: 'Great job!' }, position: { x: 350, y: 150 } },
            ],
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
            enabled: true,
            lastRun: new Date().toISOString(),
            runCount: 42
        }
    ]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);

    const createWorkflow = () => {
        const newWorkflow: Workflow = {
            id: Date.now().toString(),
            name: 'New Workflow',
            description: 'Configure your automation',
            nodes: [],
            edges: [],
            enabled: false,
            runCount: 0
        };
        setWorkflows([newWorkflow, ...workflows]);
        setSelectedWorkflow(newWorkflow);
    };

    const toggleWorkflow = (id: string) => {
        setWorkflows(workflows.map(w =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
        ));
    };

    const deleteWorkflow = (id: string) => {
        setWorkflows(workflows.filter(w => w.id !== id));
        if (selectedWorkflow?.id === id) {
            setSelectedWorkflow(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <GitBranch className="w-7 h-7 text-primary-400" />
                        Workflow Automation
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Create automated workflows to boost your productivity
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="px-4 py-2 bg-dark-800 text-dark-200 rounded-lg hover:bg-dark-700 transition-colors flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Templates
                    </button>
                    <button
                        onClick={createWorkflow}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Workflow
                    </button>
                </div>
            </div>

            {/* Templates Section */}
            {showTemplates && (
                <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Copy className="w-4 h-4 text-primary-400" />
                        Workflow Templates
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary-500/20 rounded-lg">
                                        <template.icon className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <span className="font-medium text-white">{template.name}</span>
                                </div>
                                <p className="text-sm text-dark-400">{template.description}</p>
                                <div className="mt-2 text-xs text-dark-500">
                                    {template.nodes} nodes
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-3 gap-6">
                {/* Workflow List */}
                <div className="col-span-1 space-y-3">
                    <h3 className="font-medium text-white">Your Workflows</h3>
                    {workflows.length === 0 ? (
                        <div className="p-8 bg-dark-800 rounded-xl border border-dark-700 text-center">
                            <GitBranch className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                            <p className="text-dark-400">No workflows yet</p>
                            <button
                                onClick={createWorkflow}
                                className="mt-3 text-primary-400 hover:text-primary-300"
                            >
                                Create your first workflow
                            </button>
                        </div>
                    ) : (
                        workflows.map(workflow => (
                            <div
                                key={workflow.id}
                                onClick={() => setSelectedWorkflow(workflow)}
                                className={`p-4 bg-dark-800 rounded-xl border cursor-pointer transition-all ${selectedWorkflow?.id === workflow.id
                                        ? 'border-primary-500 bg-primary-500/5'
                                        : 'border-dark-700 hover:border-dark-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-white">{workflow.name}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWorkflow(workflow.id);
                                        }}
                                        className={`w-10 h-5 rounded-full transition-colors ${workflow.enabled ? 'bg-green-500' : 'bg-dark-600'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${workflow.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>
                                <p className="text-sm text-dark-400 line-clamp-1">{workflow.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                                    <span>{workflow.nodes.length} nodes</span>
                                    <span>{workflow.runCount} runs</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Workflow Editor */}
                <div className="col-span-2">
                    {selectedWorkflow ? (
                        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                            {/* Editor Header */}
                            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Edit className="w-4 h-4 text-dark-400" />
                                    <input
                                        type="text"
                                        value={selectedWorkflow.name}
                                        onChange={(e) => {
                                            setWorkflows(workflows.map(w =>
                                                w.id === selectedWorkflow.id
                                                    ? { ...w, name: e.target.value }
                                                    : w
                                            ));
                                            setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value });
                                        }}
                                        className="bg-transparent text-white font-medium focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-dark-400 hover:text-white transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-dark-400 hover:text-green-400 transition-colors">
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteWorkflow(selectedWorkflow.id)}
                                        className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Canvas */}
                            <div className="h-80 bg-dark-900 relative">
                                {selectedWorkflow.nodes.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-dark-400 mb-3">Add a trigger to start building</p>
                                            <button className="btn-primary">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Trigger
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 flex items-center gap-4">
                                        {selectedWorkflow.nodes.map((node, i) => (
                                            <div key={node.id} className="flex items-center gap-2">
                                                <div className={`p-4 rounded-xl border-2 ${node.type === 'trigger'
                                                        ? 'bg-green-500/10 border-green-500/30'
                                                        : 'bg-blue-500/10 border-blue-500/30'
                                                    }`}>
                                                    <div className="flex items-center gap-2">
                                                        {node.type === 'trigger' ? (
                                                            <Zap className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <Bell className="w-5 h-5 text-blue-400" />
                                                        )}
                                                        <span className="text-white font-medium">{node.name}</span>
                                                    </div>
                                                </div>
                                                {i < selectedWorkflow.nodes.length - 1 && (
                                                    <ArrowRight className="w-5 h-5 text-dark-500" />
                                                )}
                                            </div>
                                        ))}
                                        <button className="p-3 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 hover:border-primary-500 hover:text-primary-400 transition-colors">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Node Palette */}
                            <div className="p-4 border-t border-dark-700">
                                <div className="flex gap-6">
                                    <div>
                                        <h4 className="text-xs text-dark-500 uppercase mb-2">Triggers</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {TRIGGERS.slice(0, 3).map(trigger => (
                                                <button
                                                    key={trigger.id}
                                                    className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors flex items-center gap-2"
                                                >
                                                    <trigger.icon className="w-4 h-4" style={{ color: trigger.color }} />
                                                    <span className="text-sm text-dark-200">{trigger.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-dark-500 uppercase mb-2">Actions</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {ACTIONS.slice(0, 3).map(action => (
                                                <button
                                                    key={action.id}
                                                    className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors flex items-center gap-2"
                                                >
                                                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                                                    <span className="text-sm text-dark-200">{action.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-center">
                            <div className="text-center">
                                <GitBranch className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                                <p className="text-dark-400">Select a workflow to edit</p>
                                <p className="text-sm text-dark-500 mt-1">or create a new one</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
