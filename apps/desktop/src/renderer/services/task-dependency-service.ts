// apps/desktop/src/renderer/services/task-dependency-service.ts

export type DependencyType = 'blocking' | 'soft' | 'subtask';

export interface TaskDependency {
    id: string;
    sourceTaskId: string;      // The task that depends on another
    targetTaskId: string;      // The task being depended on
    type: DependencyType;
    createdAt: Date;
}

export interface DependencyNode {
    taskId: string;
    taskTitle: string;
    blockedBy: string[];       // Task IDs that block this
    blocks: string[];          // Task IDs that this blocks
    subtasks: string[];        // Subtask IDs
    parentId?: string;         // Parent task if this is a subtask
    isBlocked: boolean;
    completionStatus: 'pending' | 'in_progress' | 'completed';
}

export interface DependencyGraph {
    nodes: Map<string, DependencyNode>;
    edges: TaskDependency[];
}

class TaskDependencyService {
    private dependencies: Map<string, TaskDependency> = new Map();
    private taskCompletionStatus: Map<string, 'pending' | 'in_progress' | 'completed'> = new Map();
    private taskTitles: Map<string, string> = new Map();
    private storageKey = 'wakey-task-dependencies';
    private statusKey = 'wakey-task-status';

    constructor() {
        this.loadFromStorage();
    }

    private generateId(): string {
        return `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.dependencies = new Map(
                    data.map((d: any) => [d.id, {
                        ...d,
                        createdAt: new Date(d.createdAt)
                    }])
                );
            }

            const statusStored = localStorage.getItem(this.statusKey);
            if (statusStored) {
                this.taskCompletionStatus = new Map(JSON.parse(statusStored));
            }
        } catch (error) {
            console.error('Failed to load dependencies:', error);
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(Array.from(this.dependencies.values()))
            );
            localStorage.setItem(
                this.statusKey,
                JSON.stringify(Array.from(this.taskCompletionStatus.entries()))
            );
        } catch (error) {
            console.error('Failed to save dependencies:', error);
        }
    }

    // Register a task for dependency tracking
    registerTask(taskId: string, title: string): void {
        this.taskTitles.set(taskId, title);
        if (!this.taskCompletionStatus.has(taskId)) {
            this.taskCompletionStatus.set(taskId, 'pending');
            this.saveToStorage();
        }
    }

    // Add a dependency relationship
    async addDependency(
        sourceTaskId: string,
        targetTaskId: string,
        type: DependencyType = 'blocking'
    ): Promise<TaskDependency> {
        // Check for circular dependencies
        if (this.wouldCreateCycle(sourceTaskId, targetTaskId)) {
            throw new Error('Cannot create circular dependency');
        }

        const dependency: TaskDependency = {
            id: this.generateId(),
            sourceTaskId,
            targetTaskId,
            type,
            createdAt: new Date()
        };

        this.dependencies.set(dependency.id, dependency);
        this.saveToStorage();
        return dependency;
    }

    // Remove a dependency
    async removeDependency(dependencyId: string): Promise<void> {
        this.dependencies.delete(dependencyId);
        this.saveToStorage();
    }

    // Remove all dependencies for a task
    async removeAllDependenciesForTask(taskId: string): Promise<void> {
        for (const [id, dep] of this.dependencies.entries()) {
            if (dep.sourceTaskId === taskId || dep.targetTaskId === taskId) {
                this.dependencies.delete(id);
            }
        }
        this.saveToStorage();
    }

    // Check if task is blocked
    isTaskBlocked(taskId: string): boolean {
        const blockingDeps = this.getBlockingDependencies(taskId);

        for (const dep of blockingDeps) {
            const targetStatus = this.taskCompletionStatus.get(dep.targetTaskId);
            if (targetStatus !== 'completed') {
                return true;
            }
        }

        return false;
    }

    // Get dependencies that block a task
    getBlockingDependencies(taskId: string): TaskDependency[] {
        return Array.from(this.dependencies.values())
            .filter(d => d.sourceTaskId === taskId && d.type === 'blocking');
    }

    // Get tasks that this task blocks
    getBlockedTasks(taskId: string): TaskDependency[] {
        return Array.from(this.dependencies.values())
            .filter(d => d.targetTaskId === taskId && d.type === 'blocking');
    }

    // Get subtasks of a task
    getSubtasks(parentTaskId: string): TaskDependency[] {
        return Array.from(this.dependencies.values())
            .filter(d => d.targetTaskId === parentTaskId && d.type === 'subtask');
    }

    // Get parent task if this is a subtask
    getParentTask(subtaskId: string): TaskDependency | undefined {
        return Array.from(this.dependencies.values())
            .find(d => d.sourceTaskId === subtaskId && d.type === 'subtask');
    }

    // Check for circular dependencies
    private wouldCreateCycle(sourceId: string, targetId: string): boolean {
        // BFS to check if we can reach source from target
        const visited = new Set<string>();
        const queue = [targetId];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current === sourceId) {
                return true;
            }

            if (visited.has(current)) continue;
            visited.add(current);

            // Get all tasks that current depends on
            const dependsOn = Array.from(this.dependencies.values())
                .filter(d => d.sourceTaskId === current)
                .map(d => d.targetTaskId);

            queue.push(...dependsOn);
        }

        return false;
    }

    // Update task status
    async updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<void> {
        this.taskCompletionStatus.set(taskId, status);
        this.saveToStorage();

        // If completed, check if any blocked tasks are now unblocked
        if (status === 'completed') {
            await this.notifyUnblockedTasks(taskId);
        }
    }

    private async notifyUnblockedTasks(completedTaskId: string): Promise<void> {
        const unblockedTasks: string[] = [];

        // Find tasks that were waiting on this one
        const waitingDeps = this.getBlockedTasks(completedTaskId);

        for (const dep of waitingDeps) {
            const sourceTaskId = dep.sourceTaskId;
            if (!this.isTaskBlocked(sourceTaskId)) {
                unblockedTasks.push(sourceTaskId);
            }
        }

        // Emit event or notify subscribers
        if (unblockedTasks.length > 0) {
            console.log('Tasks unblocked:', unblockedTasks.map(id => this.taskTitles.get(id)));
            // Could dispatch an event here for UI updates
        }
    }

    // Build the complete dependency graph
    buildDependencyGraph(taskIds: string[]): DependencyGraph {
        const nodes = new Map<string, DependencyNode>();
        const edges = Array.from(this.dependencies.values());

        for (const taskId of taskIds) {
            const blockedBy = this.getBlockingDependencies(taskId).map(d => d.targetTaskId);
            const blocks = this.getBlockedTasks(taskId).map(d => d.sourceTaskId);
            const subtasks = this.getSubtasks(taskId).map(d => d.sourceTaskId);
            const parent = this.getParentTask(taskId);

            nodes.set(taskId, {
                taskId,
                taskTitle: this.taskTitles.get(taskId) || 'Unknown',
                blockedBy,
                blocks,
                subtasks,
                parentId: parent?.targetTaskId,
                isBlocked: this.isTaskBlocked(taskId),
                completionStatus: this.taskCompletionStatus.get(taskId) || 'pending'
            });
        }

        return { nodes, edges };
    }

    // Get execution order (topological sort)
    getExecutionOrder(taskIds: string[]): string[] {
        const graph = this.buildDependencyGraph(taskIds);
        const visited = new Set<string>();
        const result: string[] = [];

        const visit = (taskId: string) => {
            if (visited.has(taskId)) return;
            visited.add(taskId);

            const node = graph.nodes.get(taskId);
            if (node) {
                // Visit all dependencies first
                for (const depId of node.blockedBy) {
                    visit(depId);
                }
            }

            result.push(taskId);
        };

        for (const taskId of taskIds) {
            visit(taskId);
        }

        return result;
    }

    // Get next available tasks (not blocked)
    getAvailableTasks(taskIds: string[]): string[] {
        return taskIds.filter(id => {
            const status = this.taskCompletionStatus.get(id);
            return status !== 'completed' && !this.isTaskBlocked(id);
        });
    }

    // Calculate completion percentage considering dependencies
    getCompletionProgress(taskIds: string[]): {
        total: number;
        completed: number;
        blocked: number;
        available: number;
        percentage: number;
    } {
        const completed = taskIds.filter(
            id => this.taskCompletionStatus.get(id) === 'completed'
        ).length;

        const blocked = taskIds.filter(
            id => this.taskCompletionStatus.get(id) !== 'completed' && this.isTaskBlocked(id)
        ).length;

        const available = taskIds.filter(
            id => this.taskCompletionStatus.get(id) !== 'completed' && !this.isTaskBlocked(id)
        ).length;

        return {
            total: taskIds.length,
            completed,
            blocked,
            available,
            percentage: taskIds.length > 0 ? Math.round((completed / taskIds.length) * 100) : 0
        };
    }

    // Visualize dependency tree as text
    visualizeDependencyTree(rootTaskIds: string[], indent: number = 0): string {
        let result = '';
        const prefix = '  '.repeat(indent);

        for (const taskId of rootTaskIds) {
            const title = this.taskTitles.get(taskId) || taskId;
            const status = this.taskCompletionStatus.get(taskId) || 'pending';
            const blocked = this.isTaskBlocked(taskId);

            const statusIcon = status === 'completed' ? '✅' : blocked ? '🔒' : '⬜';
            result += `${prefix}${statusIcon} ${title}\n`;

            // Show subtasks
            const subtasks = this.getSubtasks(taskId).map(d => d.sourceTaskId);
            if (subtasks.length > 0) {
                result += this.visualizeDependencyTree(subtasks, indent + 1);
            }
        }

        return result;
    }

    // Get all dependencies
    getAllDependencies(): TaskDependency[] {
        return Array.from(this.dependencies.values());
    }

    // Clear all dependencies (for testing)
    clearAll(): void {
        this.dependencies.clear();
        this.taskCompletionStatus.clear();
        this.taskTitles.clear();
        this.saveToStorage();
    }
}

export const taskDependencyService = new TaskDependencyService();
