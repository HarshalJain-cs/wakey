// apps/desktop/src/renderer/services/team-collaboration-service.ts

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    avatar?: string;
    status: 'online' | 'away' | 'focusing' | 'offline';
    currentTask?: string;
    focusScore?: number;
    joinedAt: Date;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    members: TeamMember[];
    createdAt: Date;
    settings: TeamSettings;
}

export interface TeamSettings {
    allowMemberInvites: boolean;
    shareGoalsDefault: boolean;
    shareProgressDefault: boolean;
    requireFocusHoursMin?: number;
    dailyStandupEnabled: boolean;
    standupTime?: string;
    notificationsEnabled: boolean;
}

export interface SharedGoal {
    id: string;
    teamId: string;
    title: string;
    description?: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline?: Date;
    createdBy: string;
    contributors: { memberId: string; contribution: number }[];
    status: 'active' | 'completed' | 'paused';
    createdAt: Date;
}

export interface TeamActivity {
    id: string;
    teamId: string;
    memberId: string;
    memberName: string;
    type: 'focus_session' | 'goal_progress' | 'task_complete' | 'milestone' | 'joined' | 'achievement';
    description: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

export interface TeamAnalytics {
    teamId: string;
    period: 'day' | 'week' | 'month';
    totalFocusHours: number;
    avgFocusScore: number;
    tasksCompleted: number;
    goalsAchieved: number;
    topPerformers: { memberId: string; score: number }[];
    focusTrend: { date: string; hours: number }[];
    productivityByMember: { memberId: string; hours: number; tasks: number }[];
}

class TeamCollaborationService {
    private teams: Map<string, Team> = new Map();
    private sharedGoals: Map<string, SharedGoal> = new Map();
    private activities: TeamActivity[] = [];
    private storageKey = 'wakey-teams';
    private goalsKey = 'wakey-shared-goals';
    private activitiesKey = 'wakey-team-activities';

    constructor() {
        this.loadFromStorage();
    }

    private generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private loadFromStorage(): void {
        try {
            const teamsData = localStorage.getItem(this.storageKey);
            if (teamsData) {
                const parsed = JSON.parse(teamsData);
                this.teams = new Map(parsed.map((t: any) => [t.id, {
                    ...t,
                    createdAt: new Date(t.createdAt),
                    members: t.members.map((m: any) => ({ ...m, joinedAt: new Date(m.joinedAt) }))
                }]));
            }

            const goalsData = localStorage.getItem(this.goalsKey);
            if (goalsData) {
                const parsed = JSON.parse(goalsData);
                this.sharedGoals = new Map(parsed.map((g: any) => [g.id, {
                    ...g,
                    deadline: g.deadline ? new Date(g.deadline) : undefined,
                    createdAt: new Date(g.createdAt)
                }]));
            }

            const activitiesData = localStorage.getItem(this.activitiesKey);
            if (activitiesData) {
                this.activities = JSON.parse(activitiesData).map((a: any) => ({
                    ...a,
                    timestamp: new Date(a.timestamp)
                }));
            }
        } catch (error) {
            console.error('Failed to load team data:', error);
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.teams.values())));
            localStorage.setItem(this.goalsKey, JSON.stringify(Array.from(this.sharedGoals.values())));
            localStorage.setItem(this.activitiesKey, JSON.stringify(this.activities.slice(-500)));
        } catch (error) {
            console.error('Failed to save team data:', error);
        }
    }

    // Team Management
    async createTeam(name: string, description?: string): Promise<Team> {
        const team: Team = {
            id: this.generateId(),
            name,
            description,
            members: [],
            createdAt: new Date(),
            settings: {
                allowMemberInvites: true,
                shareGoalsDefault: true,
                shareProgressDefault: true,
                dailyStandupEnabled: false,
                notificationsEnabled: true
            }
        };

        this.teams.set(team.id, team);
        this.saveToStorage();
        return team;
    }

    getTeam(teamId: string): Team | undefined {
        return this.teams.get(teamId);
    }

    getAllTeams(): Team[] {
        return Array.from(this.teams.values());
    }

    async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team | null> {
        const team = this.teams.get(teamId);
        if (!team) return null;

        const updated = { ...team, ...updates };
        this.teams.set(teamId, updated);
        this.saveToStorage();
        return updated;
    }

    async deleteTeam(teamId: string): Promise<void> {
        this.teams.delete(teamId);
        // Clean up associated data
        for (const [id, goal] of this.sharedGoals) {
            if (goal.teamId === teamId) {
                this.sharedGoals.delete(id);
            }
        }
        this.activities = this.activities.filter(a => a.teamId !== teamId);
        this.saveToStorage();
    }

    // Member Management
    async addMember(teamId: string, member: Omit<TeamMember, 'joinedAt'>): Promise<TeamMember | null> {
        const team = this.teams.get(teamId);
        if (!team) return null;

        const newMember: TeamMember = {
            ...member,
            joinedAt: new Date()
        };

        team.members.push(newMember);
        this.saveToStorage();

        // Record activity
        this.addActivity(teamId, member.id, member.name, 'joined', `${member.name} joined the team`);

        return newMember;
    }

    async removeMember(teamId: string, memberId: string): Promise<void> {
        const team = this.teams.get(teamId);
        if (!team) return;

        team.members = team.members.filter(m => m.id !== memberId);
        this.saveToStorage();
    }

    async updateMemberStatus(
        teamId: string,
        memberId: string,
        status: TeamMember['status'],
        currentTask?: string
    ): Promise<void> {
        const team = this.teams.get(teamId);
        if (!team) return;

        const member = team.members.find(m => m.id === memberId);
        if (member) {
            member.status = status;
            member.currentTask = currentTask;
            this.saveToStorage();
        }
    }

    // Shared Goals
    async createSharedGoal(
        teamId: string,
        title: string,
        targetValue: number,
        unit: string,
        createdBy: string,
        deadline?: Date
    ): Promise<SharedGoal> {
        const goal: SharedGoal = {
            id: this.generateId(),
            teamId,
            title,
            targetValue,
            currentValue: 0,
            unit,
            deadline,
            createdBy,
            contributors: [],
            status: 'active',
            createdAt: new Date()
        };

        this.sharedGoals.set(goal.id, goal);
        this.saveToStorage();
        return goal;
    }

    getTeamGoals(teamId: string): SharedGoal[] {
        return Array.from(this.sharedGoals.values())
            .filter(g => g.teamId === teamId);
    }

    async contributeToGoal(
        goalId: string,
        memberId: string,
        contribution: number
    ): Promise<SharedGoal | null> {
        const goal = this.sharedGoals.get(goalId);
        if (!goal) return null;

        goal.currentValue += contribution;

        const existing = goal.contributors.find(c => c.memberId === memberId);
        if (existing) {
            existing.contribution += contribution;
        } else {
            goal.contributors.push({ memberId, contribution });
        }

        if (goal.currentValue >= goal.targetValue) {
            goal.status = 'completed';
        }

        this.saveToStorage();
        return goal;
    }

    // Activity Feed
    addActivity(
        teamId: string,
        memberId: string,
        memberName: string,
        type: TeamActivity['type'],
        description: string,
        metadata?: Record<string, any>
    ): void {
        const activity: TeamActivity = {
            id: this.generateId(),
            teamId,
            memberId,
            memberName,
            type,
            description,
            metadata,
            timestamp: new Date()
        };

        this.activities.unshift(activity);
        this.saveToStorage();
    }

    getTeamActivities(teamId: string, limit: number = 50): TeamActivity[] {
        return this.activities
            .filter(a => a.teamId === teamId)
            .slice(0, limit);
    }

    // Analytics
    getTeamAnalytics(teamId: string, period: 'day' | 'week' | 'month' = 'week'): TeamAnalytics {
        const team = this.teams.get(teamId);
        const activities = this.activities.filter(a => a.teamId === teamId);

        const now = new Date();
        const periodStart = new Date(now);
        if (period === 'day') periodStart.setDate(now.getDate() - 1);
        else if (period === 'week') periodStart.setDate(now.getDate() - 7);
        else periodStart.setMonth(now.getMonth() - 1);

        const recentActivities = activities.filter(a => a.timestamp >= periodStart);

        const focusSessions = recentActivities.filter(a => a.type === 'focus_session');
        const tasksCompleted = recentActivities.filter(a => a.type === 'task_complete').length;
        const goalsAchieved = recentActivities.filter(a => a.type === 'goal_progress').length;

        // Calculate focus hours from metadata
        const totalFocusMinutes = focusSessions.reduce(
            (sum, a) => sum + (a.metadata?.minutes || 0), 0
        );

        // Calculate by member
        const memberStats = new Map<string, { hours: number; tasks: number; score: number }>();
        for (const activity of recentActivities) {
            const stats = memberStats.get(activity.memberId) || { hours: 0, tasks: 0, score: 0 };
            if (activity.type === 'focus_session') {
                stats.hours += (activity.metadata?.minutes || 0) / 60;
                stats.score += activity.metadata?.score || 0;
            }
            if (activity.type === 'task_complete') {
                stats.tasks++;
            }
            memberStats.set(activity.memberId, stats);
        }

        const productivityByMember = Array.from(memberStats.entries()).map(([id, stats]) => ({
            memberId: id,
            hours: Math.round(stats.hours * 10) / 10,
            tasks: stats.tasks
        }));

        const topPerformers = productivityByMember
            .sort((a, b) => b.hours + b.tasks - a.hours - a.tasks)
            .slice(0, 5)
            .map(p => ({ memberId: p.memberId, score: p.hours * 10 + p.tasks * 5 }));

        const members = team?.members ?? [];
        const avgFocusScore = members.length > 0
            ? members.reduce((s, m) => s + (m.focusScore || 0), 0) / members.length
            : 0;

        return {
            teamId,
            period,
            totalFocusHours: Math.round(totalFocusMinutes / 60 * 10) / 10,
            avgFocusScore,
            tasksCompleted,
            goalsAchieved,
            topPerformers,
            focusTrend: this.calculateFocusTrend(teamId, period),
            productivityByMember
        };
    }

    private calculateFocusTrend(_teamId: string, period: 'day' | 'week' | 'month'): { date: string; hours: number }[] {
        const days = period === 'day' ? 24 : period === 'week' ? 7 : 30;
        const trend: { date: string; hours: number }[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            if (period === 'day') {
                date.setHours(date.getHours() - i);
            } else {
                date.setDate(date.getDate() - i);
            }

            // Mock data for demonstration
            trend.push({
                date: period === 'day'
                    ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
                    : date.toLocaleDateString('en-US', { weekday: 'short' }),
                hours: Math.random() * 4 + 2
            });
        }

        return trend;
    }

    // Leaderboard
    getLeaderboard(teamId: string): { member: TeamMember; rank: number; score: number }[] {
        const team = this.teams.get(teamId);
        if (!team) return [];

        return team.members
            .map(member => ({
                member,
                rank: 0,
                score: member.focusScore || Math.floor(Math.random() * 100)
            }))
            .sort((a, b) => b.score - a.score)
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }
}

export const teamCollaborationService = new TeamCollaborationService();
