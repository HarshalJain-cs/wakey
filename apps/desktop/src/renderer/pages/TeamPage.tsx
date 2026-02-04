/**
 * Team Collaboration Page
 * Manage team workspaces, shared projects, and collaboration
 */

import { useState } from 'react';
import {
    Users,
    Plus,
    Settings,
    Crown,
    Shield,
    User,
    Mail,
    Link,
    Copy,
    MoreVertical,
    ChevronRight,
    Target,
    Trophy,
    Activity,
    Calendar,
    CheckSquare,
    Clock,
    MessageSquare,
    Video,
    Star,
    TrendingUp,
    BarChart2
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    status: 'active' | 'pending' | 'offline';
    focusTimeToday: number;
    tasksCompleted: number;
    joinedAt: string;
}

interface Team {
    id: string;
    name: string;
    description: string;
    avatar: string | null;
    memberCount: number;
    members: TeamMember[];
    plan: 'free' | 'pro' | 'enterprise';
    createdAt: string;
}

interface SharedProject {
    id: string;
    name: string;
    description: string;
    color: string;
    memberCount: number;
    taskCount: number;
    completedTasks: number;
    dueDate: string | null;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_TEAM: Team = {
    id: 'team-1',
    name: 'Productivity Squad',
    description: 'We ship features fast and stay focused',
    avatar: null,
    memberCount: 5,
    plan: 'pro',
    createdAt: '2025-01-15',
    members: [
        { id: '1', name: 'Alex Johnson', email: 'alex@team.com', avatar: null, role: 'owner', status: 'active', focusTimeToday: 185, tasksCompleted: 12, joinedAt: '2025-01-15' },
        { id: '2', name: 'Sarah Chen', email: 'sarah@team.com', avatar: null, role: 'admin', status: 'active', focusTimeToday: 210, tasksCompleted: 8, joinedAt: '2025-01-16' },
        { id: '3', name: 'Mike Williams', email: 'mike@team.com', avatar: null, role: 'member', status: 'active', focusTimeToday: 145, tasksCompleted: 6, joinedAt: '2025-01-20' },
        { id: '4', name: 'Emily Davis', email: 'emily@team.com', avatar: null, role: 'member', status: 'offline', focusTimeToday: 90, tasksCompleted: 4, joinedAt: '2025-02-01' },
        { id: '5', name: 'New Member', email: 'new@team.com', avatar: null, role: 'viewer', status: 'pending', focusTimeToday: 0, tasksCompleted: 0, joinedAt: '2025-02-02' },
    ],
};

const MOCK_PROJECTS: SharedProject[] = [
    { id: 'p1', name: 'Q1 Product Launch', description: 'New feature releases', color: '#3B82F6', memberCount: 4, taskCount: 24, completedTasks: 18, dueDate: '2026-03-31' },
    { id: 'p2', name: 'Marketing Campaign', description: 'Brand awareness', color: '#10B981', memberCount: 3, taskCount: 16, completedTasks: 12, dueDate: '2026-02-28' },
    { id: 'p3', name: 'Infrastructure', description: 'Backend improvements', color: '#8B5CF6', memberCount: 2, taskCount: 8, completedTasks: 3, dueDate: null },
];

// ============================================
// COMPONENTS
// ============================================

function RoleBadge({ role }: { role: TeamMember['role'] }) {
    const config = {
        owner: { icon: Crown, color: 'text-amber-400 bg-amber-400/20', label: 'Owner' },
        admin: { icon: Shield, color: 'text-blue-400 bg-blue-400/20', label: 'Admin' },
        member: { icon: User, color: 'text-green-400 bg-green-400/20', label: 'Member' },
        viewer: { icon: User, color: 'text-dark-400 bg-dark-700', label: 'Viewer' },
    };
    const { icon: Icon, color, label } = config[role];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

function StatusDot({ status }: { status: TeamMember['status'] }) {
    const colors = {
        active: 'bg-green-500',
        pending: 'bg-amber-500',
        offline: 'bg-dark-500',
    };
    return (
        <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TeamPage() {
    const [team] = useState<Team>(MOCK_TEAM);
    const [projects] = useState<SharedProject[]>(MOCK_PROJECTS);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'members' | 'projects' | 'analytics'>('members');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLink] = useState('https://wakey.app/join/abc123');

    const totalFocusTime = team.members.reduce((sum, m) => sum + m.focusTimeToday, 0);
    const totalTasks = team.members.reduce((sum, m) => sum + m.tasksCompleted, 0);
    const activeMembers = team.members.filter(m => m.status === 'active').length;

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="min-h-screen bg-dark-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary-500/20 text-primary-400 font-medium uppercase">
                                {team.plan}
                            </span>
                        </div>
                        <p className="text-dark-400">{team.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Invite Members
                    </button>
                    <button className="p-2 bg-dark-800 border border-dark-700 rounded-xl hover:bg-dark-700 transition-colors">
                        <Settings className="w-5 h-5 text-dark-400" />
                    </button>
                </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-blue-500/20">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Active Now</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{activeMembers}/{team.memberCount}</div>
                </div>

                <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-green-500/20">
                            <Clock className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Team Focus Today</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatTime(totalFocusTime)}</div>
                </div>

                <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-purple-500/20">
                            <CheckSquare className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Tasks Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalTasks}</div>
                </div>

                <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-amber-500/20">
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <span className="text-dark-400 text-sm">Team Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-white">12 days</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-dark-800 p-1 rounded-xl w-fit">
                {(['members', 'projects', 'analytics'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Members Tab */}
            {activeTab === 'members' && (
                <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left p-4 text-sm font-medium text-dark-400">Member</th>
                                <th className="text-left p-4 text-sm font-medium text-dark-400">Role</th>
                                <th className="text-left p-4 text-sm font-medium text-dark-400">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-dark-400">Focus Today</th>
                                <th className="text-left p-4 text-sm font-medium text-dark-400">Tasks</th>
                                <th className="text-left p-4 text-sm font-medium text-dark-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.members.map(member => (
                                <tr key={member.id} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{member.name}</div>
                                                <div className="text-xs text-dark-400">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <RoleBadge role={member.role} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <StatusDot status={member.status} />
                                            <span className="text-sm text-dark-400 capitalize">{member.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white">{formatTime(member.focusTimeToday)}</td>
                                    <td className="p-4 text-white">{member.tasksCompleted}</td>
                                    <td className="p-4">
                                        <button className="p-1.5 rounded-lg hover:bg-dark-600 transition-colors">
                                            <MoreVertical className="w-4 h-4 text-dark-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <div className="grid grid-cols-3 gap-4">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="p-5 bg-dark-800 border border-dark-700 rounded-2xl hover:border-dark-600 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                />
                                <h3 className="font-semibold text-white">{project.name}</h3>
                            </div>
                            <p className="text-sm text-dark-400 mb-4">{project.description}</p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Progress</span>
                                    <span className="text-white">{Math.round((project.completedTasks / project.taskCount) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(project.completedTasks / project.taskCount) * 100}%`,
                                            backgroundColor: project.color
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs text-dark-500">
                                    <span>{project.completedTasks}/{project.taskCount} tasks</span>
                                    <span>{project.memberCount} members</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Project Card */}
                    <button className="p-5 bg-dark-800/50 border border-dashed border-dark-600 rounded-2xl hover:border-primary-500/50 transition-colors flex flex-col items-center justify-center gap-3 min-h-[180px]">
                        <div className="p-3 rounded-xl bg-dark-700">
                            <Plus className="w-6 h-6 text-dark-400" />
                        </div>
                        <span className="text-dark-400 font-medium">Create Project</span>
                    </button>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-dark-800 border border-dark-700 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Team Productivity Trend
                        </h3>
                        <div className="h-48 flex items-end justify-between gap-2">
                            {[65, 78, 82, 75, 90, 88, 95].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg"
                                        style={{ height: `${val}%` }}
                                    />
                                    <span className="text-xs text-dark-500">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-dark-800 border border-dark-700 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400" />
                            Top Performers
                        </h3>
                        <div className="space-y-3">
                            {team.members
                                .filter(m => m.status === 'active')
                                .sort((a, b) => b.focusTimeToday - a.focusTimeToday)
                                .slice(0, 3)
                                .map((member, i) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-xl">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500 text-amber-900' :
                                                i === 1 ? 'bg-gray-400 text-gray-800' :
                                                    'bg-amber-700 text-amber-100'
                                            }`}>
                                            {i + 1}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{member.name}</div>
                                            <div className="text-xs text-dark-400">{formatTime(member.focusTimeToday)} focused</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-medium">{member.tasksCompleted}</div>
                                            <div className="text-xs text-dark-400">tasks</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl w-[450px] overflow-hidden">
                        <div className="p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white">Invite Team Members</h2>
                            <p className="text-sm text-dark-400">Add new members to your team</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Email Invite */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Invite by email
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@company.com"
                                        className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none"
                                    />
                                    <button className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Invite Link */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Or share invite link
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                        className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-dark-400 text-sm"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(inviteLink)}
                                        className="px-4 py-2 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
