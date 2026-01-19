/**
 * @fileoverview Workflow Engine Service
 * 
 * Automation workflow engine for custom actions:
 * - Trigger-based automations
 * - Multi-step workflows
 * - Integration with all Wakey services
 * - Template library
 * 
 * @module services/workflow-engine-service
 */

// ============================================
// Types
// ============================================

export interface Workflow {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    trigger: WorkflowTrigger;
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
    createdAt: Date;
    lastTriggered: Date | null;
    runCount: number;
}

export interface WorkflowTrigger {
    type: TriggerType;
    config: Record<string, unknown>;
}

export type TriggerType =
    | 'focus_started'
    | 'focus_ended'
    | 'break_started'
    | 'break_ended'
    | 'task_created'
    | 'task_completed'
    | 'achievement_unlocked'
    | 'time_of_day'
    | 'deep_work_achieved'
    | 'distraction_detected'
    | 'manual';

export interface WorkflowCondition {
    id: string;
    type: ConditionType;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: unknown;
}

export type ConditionType =
    | 'day_of_week'
    | 'time_range'
    | 'focus_score'
    | 'tasks_completed'
    | 'streak_count'
    | 'current_app';

export interface WorkflowAction {
    id: string;
    type: ActionType;
    config: Record<string, unknown>;
    order: number;
}

export type ActionType =
    | 'send_notification'
    | 'play_sound'
    | 'update_slack_status'
    | 'create_task'
    | 'start_focus'
    | 'start_break'
    | 'log_to_notion'
    | 'send_webhook'
    | 'show_message'
    | 'run_script';

export interface WorkflowRun {
    id: string;
    workflowId: string;
    triggeredAt: Date;
    completedAt: Date | null;
    status: 'running' | 'completed' | 'failed';
    actionsExecuted: number;
    error: string | null;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: 'productivity' | 'focus' | 'notifications' | 'integrations';
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'lastTriggered' | 'runCount'>;
}

// ============================================
// Built-in Templates
// ============================================

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'template_focus_complete',
        name: 'Focus Session Complete',
        description: 'Celebrate when you complete a focus session',
        category: 'focus',
        workflow: {
            name: 'Focus Complete Celebration',
            description: 'Play a sound and show notification when focus ends',
            enabled: true,
            trigger: { type: 'focus_ended', config: {} },
            conditions: [],
            actions: [
                { id: 'a1', type: 'play_sound', config: { sound: 'achievement' }, order: 1 },
                { id: 'a2', type: 'send_notification', config: { title: '🎉 Focus Complete!', body: 'Great work!' }, order: 2 },
            ],
        },
    },
    {
        id: 'template_morning_routine',
        name: 'Morning Routine',
        description: 'Start your day with a focus session',
        category: 'productivity',
        workflow: {
            name: 'Morning Focus Reminder',
            description: 'Remind to start morning focus at 9 AM on weekdays',
            enabled: true,
            trigger: { type: 'time_of_day', config: { hour: 9, minute: 0 } },
            conditions: [
                { id: 'c1', type: 'day_of_week', operator: 'not_equals', value: 0 }, // Not Sunday
                { id: 'c2', type: 'day_of_week', operator: 'not_equals', value: 6 }, // Not Saturday
            ],
            actions: [
                { id: 'a1', type: 'show_message', config: { message: 'Time for your morning focus session!' }, order: 1 },
            ],
        },
    },
    {
        id: 'template_distraction_alert',
        name: 'Distraction Alert',
        description: 'Alert when switching to distraction apps during focus',
        category: 'focus',
        workflow: {
            name: 'Distraction Warning',
            description: 'Show warning when distraction detected during focus',
            enabled: true,
            trigger: { type: 'distraction_detected', config: {} },
            conditions: [],
            actions: [
                { id: 'a1', type: 'play_sound', config: { sound: 'distraction-alert' }, order: 1 },
                { id: 'a2', type: 'show_message', config: { message: '⚠️ Stay focused!' }, order: 2 },
            ],
        },
    },
    {
        id: 'template_deep_work',
        name: 'Deep Work Celebration',
        description: 'Celebrate achieving 60+ minutes of uninterrupted focus',
        category: 'productivity',
        workflow: {
            name: 'Deep Work Achievement',
            description: 'Celebrate deep work milestones',
            enabled: true,
            trigger: { type: 'deep_work_achieved', config: {} },
            conditions: [],
            actions: [
                { id: 'a1', type: 'play_sound', config: { sound: 'achievement' }, order: 1 },
                { id: 'a2', type: 'send_notification', config: { title: '🧠 Deep Work!', body: '60+ minutes of uninterrupted focus!' }, order: 2 },
            ],
        },
    },
    {
        id: 'template_slack_focus',
        name: 'Slack Focus Status',
        description: 'Update Slack status when starting focus',
        category: 'integrations',
        workflow: {
            name: 'Slack Focus Status',
            description: 'Set Slack to DND during focus sessions',
            enabled: true,
            trigger: { type: 'focus_started', config: {} },
            conditions: [],
            actions: [
                { id: 'a1', type: 'update_slack_status', config: { emoji: ':brain:', text: 'In focus mode' }, order: 1 },
            ],
        },
    },
];

// ============================================
// Workflow Engine Service
// ============================================

class WorkflowEngineService {
    private workflows: Map<string, Workflow> = new Map();
    private runHistory: WorkflowRun[] = [];
    private activeTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor() {
        this.loadWorkflows();
        this.setupTimeBasedTriggers();
    }

    private loadWorkflows(): void {
        try {
            const stored = localStorage.getItem('wakey_workflows');
            if (stored) {
                const data = JSON.parse(stored);
                this.workflows = new Map(data.map((w: Workflow) => [w.id, w]));
            }
        } catch (error) {
            console.error('Failed to load workflows:', error);
        }
    }

    private saveWorkflows(): void {
        const data = Array.from(this.workflows.values());
        localStorage.setItem('wakey_workflows', JSON.stringify(data));
    }

    // ============================================
    // Workflow Management
    // ============================================

    /**
     * Create a new workflow
     */
    createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'lastTriggered' | 'runCount'>): Workflow {
        const newWorkflow: Workflow = {
            ...workflow,
            id: `wf_${Date.now()}`,
            createdAt: new Date(),
            lastTriggered: null,
            runCount: 0,
        };

        this.workflows.set(newWorkflow.id, newWorkflow);
        this.saveWorkflows();

        // Setup timer if time-based
        if (newWorkflow.trigger.type === 'time_of_day' && newWorkflow.enabled) {
            this.setupTimerForWorkflow(newWorkflow);
        }

        return newWorkflow;
    }

    /**
     * Update a workflow
     */
    updateWorkflow(workflowId: string, updates: Partial<Workflow>): Workflow | null {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return null;

        const updated = { ...workflow, ...updates };
        this.workflows.set(workflowId, updated);
        this.saveWorkflows();

        return updated;
    }

    /**
     * Delete a workflow
     */
    deleteWorkflow(workflowId: string): boolean {
        const deleted = this.workflows.delete(workflowId);

        // Clear timer if exists
        const timer = this.activeTimers.get(workflowId);
        if (timer) {
            clearInterval(timer);
            this.activeTimers.delete(workflowId);
        }

        this.saveWorkflows();
        return deleted;
    }

    /**
     * Toggle workflow enabled state
     */
    toggleWorkflow(workflowId: string): boolean {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return false;

        workflow.enabled = !workflow.enabled;
        this.saveWorkflows();

        return workflow.enabled;
    }

    /**
     * Get all workflows
     */
    getWorkflows(): Workflow[] {
        return Array.from(this.workflows.values());
    }

    /**
     * Get workflow by ID
     */
    getWorkflow(workflowId: string): Workflow | undefined {
        return this.workflows.get(workflowId);
    }

    /**
     * Get workflow templates
     */
    getTemplates(): WorkflowTemplate[] {
        return WORKFLOW_TEMPLATES;
    }

    /**
     * Create workflow from template
     */
    createFromTemplate(templateId: string): Workflow | null {
        const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
        if (!template) return null;

        return this.createWorkflow(template.workflow);
    }

    // ============================================
    // Trigger Handling
    // ============================================

    /**
     * Trigger workflows by event type
     */
    async trigger(triggerType: TriggerType, context: Record<string, unknown> = {}): Promise<void> {
        const matchingWorkflows = Array.from(this.workflows.values())
            .filter(w => w.enabled && w.trigger.type === triggerType);

        for (const workflow of matchingWorkflows) {
            if (this.checkConditions(workflow, context)) {
                await this.executeWorkflow(workflow, context);
            }
        }
    }

    /**
     * Check if workflow conditions are met
     */
    private checkConditions(workflow: Workflow, context: Record<string, unknown>): boolean {
        for (const condition of workflow.conditions) {
            if (!this.evaluateCondition(condition, context)) {
                return false;
            }
        }
        return true;
    }

    private evaluateCondition(condition: WorkflowCondition, context: Record<string, unknown>): boolean {
        const now = new Date();
        let actualValue: unknown;

        switch (condition.type) {
            case 'day_of_week':
                actualValue = now.getDay();
                break;
            case 'time_range':
                actualValue = now.getHours() * 60 + now.getMinutes();
                break;
            case 'focus_score':
            case 'tasks_completed':
            case 'streak_count':
            case 'current_app':
                actualValue = context[condition.type];
                break;
            default:
                return true;
        }

        switch (condition.operator) {
            case 'equals':
                return actualValue === condition.value;
            case 'not_equals':
                return actualValue !== condition.value;
            case 'greater_than':
                return (actualValue as number) > (condition.value as number);
            case 'less_than':
                return (actualValue as number) < (condition.value as number);
            case 'contains':
                return String(actualValue).includes(String(condition.value));
            default:
                return true;
        }
    }

    // ============================================
    // Workflow Execution
    // ============================================

    /**
     * Execute a workflow
     */
    private async executeWorkflow(workflow: Workflow, context: Record<string, unknown>): Promise<void> {
        const run: WorkflowRun = {
            id: `run_${Date.now()}`,
            workflowId: workflow.id,
            triggeredAt: new Date(),
            completedAt: null,
            status: 'running',
            actionsExecuted: 0,
            error: null,
        };

        console.info(`[Workflow] Executing: ${workflow.name}`);

        try {
            // Sort actions by order
            const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);

            for (const action of sortedActions) {
                await this.executeAction(action, context);
                run.actionsExecuted++;
            }

            run.status = 'completed';
            run.completedAt = new Date();

            // Update workflow stats
            workflow.lastTriggered = new Date();
            workflow.runCount++;
            this.saveWorkflows();

        } catch (error) {
            run.status = 'failed';
            run.error = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Workflow] Failed: ${workflow.name}`, error);
        }

        this.runHistory.push(run);

        // Keep only last 100 runs
        if (this.runHistory.length > 100) {
            this.runHistory = this.runHistory.slice(-100);
        }
    }

    private async executeAction(action: WorkflowAction, _context: Record<string, unknown>): Promise<void> {
        console.info(`[Workflow] Action: ${action.type}`, action.config);

        switch (action.type) {
            case 'send_notification':
                this.showNotification(
                    action.config.title as string,
                    action.config.body as string
                );
                break;

            case 'play_sound':
                // Would call audioService.playEffect()
                console.info(`[Sound] Playing: ${action.config.sound}`);
                break;

            case 'show_message':
                // Would show UI message
                console.info(`[Message] ${action.config.message}`);
                break;

            case 'update_slack_status':
                // Would call slackIntegrationService.setStatus()
                console.info(`[Slack] Status: ${action.config.emoji} ${action.config.text}`);
                break;

            case 'create_task':
                // Would create a task
                console.info(`[Task] Creating: ${action.config.title}`);
                break;

            case 'start_focus':
                // Would start a focus session
                console.info(`[Focus] Starting ${action.config.duration || 25} minutes`);
                break;

            case 'start_break':
                // Would start a break
                console.info(`[Break] Starting ${action.config.duration || 5} minutes`);
                break;

            case 'log_to_notion':
                // Would log to Notion
                console.info(`[Notion] Logging to database`);
                break;

            case 'send_webhook':
                await this.sendWebhook(
                    action.config.url as string,
                    action.config.payload as Record<string, unknown>
                );
                break;

            case 'run_script':
                // Would run custom script (sandboxed)
                console.info(`[Script] Executing custom script`);
                break;

            default:
                console.warn(`[Workflow] Unknown action type: ${action.type}`);
        }
    }

    private showNotification(title: string, body: string): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        } else {
            console.info(`[Notification] ${title}: ${body}`);
        }
    }

    private async sendWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('[Webhook] Failed:', error);
            throw error;
        }
    }

    // ============================================
    // Time-based Triggers
    // ============================================

    private setupTimeBasedTriggers(): void {
        // Check every minute for time-based workflows
        setInterval(() => {
            this.checkTimeBasedTriggers();
        }, 60000);
    }

    private checkTimeBasedTriggers(): void {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        for (const workflow of this.workflows.values()) {
            if (!workflow.enabled || workflow.trigger.type !== 'time_of_day') {
                continue;
            }

            const triggerHour = workflow.trigger.config.hour as number;
            const triggerMinute = workflow.trigger.config.minute as number;

            if (currentHour === triggerHour && currentMinute === triggerMinute) {
                this.trigger('time_of_day', { hour: currentHour, minute: currentMinute });
            }
        }
    }

    private setupTimerForWorkflow(workflow: Workflow): void {
        // Timer logic for specific workflow if needed
        console.info(`[Workflow] Timer setup for: ${workflow.name}`);
    }

    // ============================================
    // Run History
    // ============================================

    /**
     * Get run history
     */
    getRunHistory(limit: number = 20): WorkflowRun[] {
        return this.runHistory.slice(-limit).reverse();
    }

    /**
     * Get runs for a specific workflow
     */
    getWorkflowRuns(workflowId: string): WorkflowRun[] {
        return this.runHistory.filter(r => r.workflowId === workflowId);
    }
}

// Singleton instance
export const workflowEngineService = new WorkflowEngineService();
export default workflowEngineService;
