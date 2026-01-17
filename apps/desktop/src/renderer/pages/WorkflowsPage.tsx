import { useState, useEffect } from 'react';
import {
    Workflow, Play, Pause, Plus, Trash2, Settings,
    Zap, Clock, CheckCircle, AlertTriangle, ChevronRight,
    ChevronDown, Edit3, Copy, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
    workflowEngineService,
    Workflow as WorkflowType,
    WorkflowTemplate,
    WorkflowRun,
    TriggerType,
    ActionType,
} from '../services/workflow-engine-service';

// ============================================
// Types
// ============================================

interface CreateWorkflowForm {
    name: string;
    description: string;
    triggerType: TriggerType;
    actions: { type: ActionType; config: Record<string, unknown> }[];
}

// ============================================
// WorkflowsPage Component
// ============================================

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
    const [runHistory, setRunHistory] = useState<WorkflowRun[]>([]);
    const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'history'>('workflows');
    const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState<CreateWorkflowForm>({
        name: '',
        description: '',
        triggerType: 'focus_ended',
        actions: [],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setWorkflows(workflowEngineService.getWorkflows());
        setTemplates(workflowEngineService.getTemplates());
        setRunHistory(workflowEngineService.getRunHistory(20));
    };

    const handleToggleWorkflow = (workflowId: string) => {
        workflowEngineService.toggleWorkflow(workflowId);
        loadData();
    };

    const handleDeleteWorkflow = (workflowId: string) => {
        if (confirm('Are you sure you want to delete this workflow?')) {
            workflowEngineService.deleteWorkflow(workflowId);
            loadData();
        }
    };

    const handleCreateFromTemplate = (templateId: string) => {
        workflowEngineService.createFromTemplate(templateId);
        loadData();
        setActiveTab('workflows');
    };

    const handleCreateWorkflow = () => {
        if (!newWorkflow.name.trim()) return;

        workflowEngineService.createWorkflow({
            name: newWorkflow.name,
            description: newWorkflow.description,
            enabled: true,
            trigger: { type: newWorkflow.triggerType, config: {} },
            conditions: [],
            actions: newWorkflow.actions.map((a, i) => ({
                id: `action_${Date.now()}_${i}`,
                type: a.type,
                config: a.config,
                order: i + 1,
            })),
        });

        setShowCreateModal(false);
        setNewWorkflow({
            name: '',
            description: '',
            triggerType: 'focus_ended',
            actions: [],
        });
        loadData();
    };

    const getTriggerIcon = (type: TriggerType) => {
        const icons: Record<TriggerType, JSX.Element> = {
            focus_started: <Play className="w-4 h-4 text-green-400" />,
            focus_ended: <CheckCircle className="w-4 h-4 text-blue-400" />,
            break_started: <Pause className="w-4 h-4 text-yellow-400" />,
            break_ended: <Play className="w-4 h-4 text-green-400" />,
            task_created: <Plus className="w-4 h-4 text-purple-400" />,
            task_completed: <CheckCircle className="w-4 h-4 text-green-400" />,
            achievement_unlocked: <Zap className="w-4 h-4 text-yellow-400" />,
            time_of_day: <Clock className="w-4 h-4 text-orange-400" />,
            deep_work_achieved: <Zap className="w-4 h-4 text-cyan-400" />,
            distraction_detected: <AlertTriangle className="w-4 h-4 text-red-400" />,
            manual: <Settings className="w-4 h-4 text-gray-400" />,
        };
        return icons[type] || <Workflow className="w-4 h-4" />;
    };

    const formatTrigger = (type: TriggerType) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString();
    };

    // ============================================
    // Render
    // ============================================

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Workflow className="w-7 h-7 text-primary-400" />
                        Workflows
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Automate actions based on triggers
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Workflow
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-dark-800 rounded-lg w-fit">
                {(['workflows', 'templates', 'history'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white hover:bg-dark-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Workflows Tab */}
            {activeTab === 'workflows' && (
                <div className="space-y-4">
                    {workflows.length === 0 ? (
                        <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-700">
                            <Workflow className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No workflows yet</h3>
                            <p className="text-dark-400 mb-4">
                                Create your first workflow or start from a template
                            </p>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className="btn-primary"
                            >
                                Browse Templates
                            </button>
                        </div>
                    ) : (
                        workflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden"
                            >
                                {/* Workflow Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-dark-750 transition-colors"
                                    onClick={() => setExpandedWorkflow(
                                        expandedWorkflow === workflow.id ? null : workflow.id
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-dark-700">
                                                {getTriggerIcon(workflow.trigger.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{workflow.name}</h3>
                                                <p className="text-sm text-dark-400">{workflow.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Run count */}
                                            <span className="text-sm text-dark-400">
                                                {workflow.runCount} runs
                                            </span>
                                            {/* Toggle */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleWorkflow(workflow.id);
                                                }}
                                                className={`p-1 rounded ${workflow.enabled ? 'text-green-400' : 'text-dark-500'
                                                    }`}
                                            >
                                                {workflow.enabled ? (
                                                    <ToggleRight className="w-6 h-6" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6" />
                                                )}
                                            </button>
                                            {/* Expand */}
                                            {expandedWorkflow === workflow.id ? (
                                                <ChevronDown className="w-5 h-5 text-dark-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-dark-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedWorkflow === workflow.id && (
                                    <div className="p-4 pt-0 border-t border-dark-700 space-y-4">
                                        {/* Trigger */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-dark-400">Trigger:</span>
                                            <span className="px-2 py-1 bg-dark-700 rounded text-white">
                                                {formatTrigger(workflow.trigger.type)}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div>
                                            <span className="text-sm text-dark-400 block mb-2">Actions:</span>
                                            <div className="space-y-2">
                                                {workflow.actions.map((action, i) => (
                                                    <div
                                                        key={action.id}
                                                        className="flex items-center gap-2 p-2 bg-dark-700 rounded-lg text-sm"
                                                    >
                                                        <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-white">
                                                            {action.type.split('_').join(' ')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 text-sm text-dark-400">
                                            <span>Last run: {formatDate(workflow.lastTriggered)}</span>
                                            <span>Created: {formatDate(workflow.createdAt)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button className="btn-secondary flex items-center gap-2">
                                                <Edit3 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button className="btn-secondary flex items-center gap-2">
                                                <Copy className="w-4 h-4" />
                                                Duplicate
                                            </button>
                                            <button
                                                onClick={() => handleDeleteWorkflow(workflow.id)}
                                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-primary-500/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-white">{template.name}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded">
                                        {template.category}
                                    </span>
                                </div>
                                {getTriggerIcon(template.workflow.trigger.type)}
                            </div>
                            <p className="text-sm text-dark-400 mb-4">{template.description}</p>
                            <button
                                onClick={() => handleCreateFromTemplate(template.id)}
                                className="w-full btn-secondary flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Use Template
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-3">
                    {runHistory.length === 0 ? (
                        <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-700">
                            <Clock className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white">No runs yet</h3>
                            <p className="text-dark-400">Workflow runs will appear here</p>
                        </div>
                    ) : (
                        runHistory.map((run) => {
                            const workflow = workflows.find(w => w.id === run.workflowId);
                            return (
                                <div
                                    key={run.id}
                                    className="bg-dark-800 rounded-xl border border-dark-700 p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {run.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            ) : run.status === 'failed' ? (
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                                            )}
                                            <div>
                                                <h4 className="font-medium text-white">
                                                    {workflow?.name || 'Unknown Workflow'}
                                                </h4>
                                                <p className="text-sm text-dark-400">
                                                    {formatDate(run.triggeredAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm ${run.status === 'completed' ? 'text-green-400' :
                                                    run.status === 'failed' ? 'text-red-400' :
                                                        'text-yellow-400'
                                                }`}>
                                                {run.status}
                                            </span>
                                            <p className="text-xs text-dark-500">
                                                {run.actionsExecuted} actions
                                            </p>
                                        </div>
                                    </div>
                                    {run.error && (
                                        <p className="mt-2 text-sm text-red-400 bg-red-500/10 p-2 rounded">
                                            {run.error}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Create Workflow</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-dark-400 block mb-2">Name</label>
                                <input
                                    type="text"
                                    value={newWorkflow.name}
                                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                                    placeholder="My Workflow"
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-dark-400 block mb-2">Description</label>
                                <input
                                    type="text"
                                    value={newWorkflow.description}
                                    onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                                    placeholder="What does this workflow do?"
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-dark-400 block mb-2">Trigger</label>
                                <select
                                    value={newWorkflow.triggerType}
                                    onChange={(e) => setNewWorkflow({ ...newWorkflow, triggerType: e.target.value as TriggerType })}
                                    className="input-field w-full"
                                >
                                    <option value="focus_started">Focus Started</option>
                                    <option value="focus_ended">Focus Ended</option>
                                    <option value="break_started">Break Started</option>
                                    <option value="task_completed">Task Completed</option>
                                    <option value="achievement_unlocked">Achievement Unlocked</option>
                                    <option value="deep_work_achieved">Deep Work Achieved</option>
                                    <option value="distraction_detected">Distraction Detected</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateWorkflow}
                                disabled={!newWorkflow.name.trim()}
                                className="flex-1 btn-primary"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
