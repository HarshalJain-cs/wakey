// apps/desktop/src/renderer/components/widgets/TaskTreeWidget.tsx
// Phase 17: Enhanced UX - Task Tree Visualization

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

interface TreeNode {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    children: TreeNode[];
    dueDate?: string;
    estimatedMinutes?: number;
    completedMinutes?: number;
    parentId?: string;
}

interface TaskTreeWidgetProps {
    maxDepth?: number;
}

// Mock data - in production this would come from task service
const mockTaskTree: TreeNode[] = [
    {
        id: '1',
        title: 'Product Launch',
        status: 'in-progress',
        priority: 'critical',
        dueDate: '2026-02-15',
        estimatedMinutes: 480,
        completedMinutes: 180,
        children: [
            {
                id: '1-1',
                title: 'Design Phase',
                status: 'completed',
                priority: 'high',
                estimatedMinutes: 120,
                completedMinutes: 120,
                children: [
                    { id: '1-1-1', title: 'Wireframes', status: 'completed', priority: 'medium', children: [] },
                    { id: '1-1-2', title: 'High-fidelity mockups', status: 'completed', priority: 'medium', children: [] }
                ]
            },
            {
                id: '1-2',
                title: 'Development',
                status: 'in-progress',
                priority: 'high',
                estimatedMinutes: 240,
                completedMinutes: 60,
                children: [
                    { id: '1-2-1', title: 'Frontend implementation', status: 'in-progress', priority: 'high', children: [] },
                    { id: '1-2-2', title: 'Backend API', status: 'pending', priority: 'high', children: [] },
                    { id: '1-2-3', title: 'Database schema', status: 'completed', priority: 'medium', children: [] }
                ]
            },
            {
                id: '1-3',
                title: 'QA Testing',
                status: 'pending',
                priority: 'medium',
                estimatedMinutes: 120,
                completedMinutes: 0,
                children: []
            }
        ]
    },
    {
        id: '2',
        title: 'Weekly Report',
        status: 'pending',
        priority: 'medium',
        dueDate: '2026-02-07',
        estimatedMinutes: 60,
        completedMinutes: 0,
        children: []
    }
];

const TaskTreeWidget: React.FC<TaskTreeWidgetProps> = ({ maxDepth = 3 }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '1-2']));
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [tasks, _setTasks] = useState<TreeNode[]>(mockTaskTree);

    useEffect(() => {
        // In production, fetch from task service
        // taskDependencyService.getTaskTree().then(setTasks);
    }, []);

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const getStatusIcon = (status: TreeNode['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'in-progress':
                return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
            case 'blocked':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Circle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: TreeNode['priority']) => {
        switch (priority) {
            case 'critical': return 'border-l-red-500';
            case 'high': return 'border-l-orange-500';
            case 'medium': return 'border-l-yellow-500';
            default: return 'border-l-gray-500';
        }
    };

    const getProgress = (node: TreeNode): number => {
        if (node.status === 'completed') return 100;
        if (!node.estimatedMinutes) return 0;
        return Math.round((node.completedMinutes || 0) / node.estimatedMinutes * 100);
    };

    const renderNode = (node: TreeNode, depth: number = 0) => {
        if (depth >= maxDepth) return null;

        const hasChildren = node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isSelected = selectedNode === node.id;
        const progress = getProgress(node);

        return (
            <div key={node.id}>
                <div
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all
                        border-l-2 ${getPriorityColor(node.priority)}
                        ${isSelected ? 'bg-primary-500/20' : 'hover:bg-dark-700'}
                        ${depth > 0 ? 'ml-4' : ''}`}
                    onClick={() => setSelectedNode(node.id)}
                >
                    {/* Expand/Collapse */}
                    {hasChildren ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                            className="text-dark-400 hover:text-white"
                        >
                            {isExpanded ?
                                <ChevronDown className="w-4 h-4" /> :
                                <ChevronRight className="w-4 h-4" />
                            }
                        </button>
                    ) : (
                        <span className="w-4" />
                    )}

                    {/* Status Icon */}
                    {getStatusIcon(node.status)}

                    {/* Title */}
                    <span className={`flex-1 text-sm ${node.status === 'completed' ? 'text-dark-400 line-through' : 'text-white'}`}>
                        {node.title}
                    </span>

                    {/* Progress */}
                    {node.estimatedMinutes && progress < 100 && (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs text-dark-400">{progress}%</span>
                        </div>
                    )}

                    {/* Children count */}
                    {hasChildren && (
                        <span className="text-xs text-dark-500 px-1.5 py-0.5 bg-dark-700 rounded">
                            {node.children.length}
                        </span>
                    )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="pl-2 border-l border-dark-700 ml-5">
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const totalTasks = tasks.reduce((acc, node) => {
        const countNodes = (n: TreeNode): number => 1 + n.children.reduce((sum, child) => sum + countNodes(child), 0);
        return acc + countNodes(node);
    }, 0);

    const completedTasks = tasks.reduce((acc, node) => {
        const countCompleted = (n: TreeNode): number =>
            (n.status === 'completed' ? 1 : 0) + n.children.reduce((sum, child) => sum + countCompleted(child), 0);
        return acc + countCompleted(node);
    }, 0);

    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🌳</span>
                    <h3 className="font-semibold text-white">Task Tree</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-dark-400">
                        {completedTasks}/{totalTasks} complete
                    </span>
                    <div className="w-12 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500"
                            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Tree View */}
            <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                {tasks.map(task => renderNode(task))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-700">
                <div className="flex items-center gap-1 text-xs text-dark-400">
                    <Circle className="w-3 h-3" /> Pending
                </div>
                <div className="flex items-center gap-1 text-xs text-dark-400">
                    <Clock className="w-3 h-3 text-blue-400" /> In Progress
                </div>
                <div className="flex items-center gap-1 text-xs text-dark-400">
                    <CheckCircle className="w-3 h-3 text-green-500" /> Done
                </div>
                <div className="flex items-center gap-1 text-xs text-dark-400">
                    <AlertCircle className="w-3 h-3 text-red-500" /> Blocked
                </div>
            </div>
        </div>
    );
};

export default TaskTreeWidget;
