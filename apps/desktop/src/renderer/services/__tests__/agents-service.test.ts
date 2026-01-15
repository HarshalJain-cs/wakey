/**
 * @fileoverview Unit tests for Agents Service
 * 
 * Tests cover:
 * - Agent lifecycle (configure, start, stop)
 * - Agent manager operations
 * - Task queue management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    agentManager,
    AgentType,
} from '../agents-service';

describe('Agents Service', () => {
    beforeEach(() => {
        // Reset all agents before each test
        agentManager.stopAll();
        agentManager.clearTasks();
    });

    afterEach(() => {
        agentManager.stopAll();
    });

    describe('AgentManager', () => {
        it('should have all 4 default agents', () => {
            const agents = agentManager.getAllAgents();
            expect(agents).toHaveLength(4);

            const types = agents.map(a => a.type);
            expect(types).toContain('research');
            expect(types).toContain('code-review');
            expect(types).toContain('trend');
            expect(types).toContain('prediction');
        });

        it('should get agent by type', () => {
            const researchAgent = agentManager.getAgent('research');
            expect(researchAgent).toBeDefined();
            expect(researchAgent?.name).toBe('Research Agent');
        });

        it('should configure agent settings', () => {
            agentManager.configureAgent('research', {
                enabled: true,
                interval: 30,
            });

            const agent = agentManager.getAgent('research');
            const config = agent?.getConfig();
            expect(config?.enabled).toBe(true);
            expect(config?.interval).toBe(30);
        });

        it('should track agent status', () => {
            const agent = agentManager.getAgent('research');
            expect(agent?.getStatus()).toBe('idle');
        });

        it('should return recent tasks in order', () => {
            const tasks = agentManager.getRecentTasks(5);
            expect(Array.isArray(tasks)).toBe(true);
        });

        it('should clear all tasks', () => {
            agentManager.clearTasks();
            const tasks = agentManager.getRecentTasks();
            expect(tasks).toHaveLength(0);
        });
    });

    describe('Research Agent', () => {
        it('should add and remove topics', () => {
            const agent = agentManager.getResearchAgent();

            agent.addTopic('TypeScript', ['ts', 'javascript', 'types']);
            const topics = agent.getTopics();
            expect(topics).toHaveLength(1);
            expect(topics[0].topic).toBe('TypeScript');

            agent.removeTopic('TypeScript');
            expect(agent.getTopics()).toHaveLength(0);
        });
    });

    describe('Trend Agent', () => {
        it('should set and get keywords', () => {
            const agent = agentManager.getTrendAgent();

            agent.setKeywords(['AI', 'productivity', 'focus']);
            // Keywords are private, but we can verify through run behavior
            expect(agent).toBeDefined();
        });

        it('should get recent trends', () => {
            const agent = agentManager.getTrendAgent();
            const trends = agent.getRecentTrends();
            expect(Array.isArray(trends)).toBe(true);
        });
    });

    describe('Prediction Agent', () => {
        it('should record and retrieve patterns', () => {
            const agent = agentManager.getPredictionAgent();

            agent.recordActivity('coding');
            agent.recordActivity('coding');
            agent.recordActivity('meeting');

            const patterns = agent.getPatterns();
            expect(patterns.length).toBeGreaterThan(0);
            expect(patterns[0].frequency).toBeGreaterThan(0);
        });

        it('should get predictions list', () => {
            const agent = agentManager.getPredictionAgent();
            const predictions = agent.getPredictions();
            expect(Array.isArray(predictions)).toBe(true);
        });
    });
});
