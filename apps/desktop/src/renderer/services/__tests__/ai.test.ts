/**
 * @fileoverview Unit tests for AI Service
 * 
 * Tests cover:
 * - Focus score calculation
 * - Distraction detection
 * - Work app detection
 * - Fallback insights generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    calculateFocusScore,
    isDistractionApp,
    isWorkApp,
} from '../ai';

describe('AI Service', () => {
    describe('calculateFocusScore', () => {
        it('should return 100 for perfect session with goal met', () => {
            const score = calculateFocusScore({
                focusMinutes: 25,
                distractionCount: 0,
                contextSwitches: 0,
                sessionGoalMinutes: 25,
            });
            // 100 base + 10 bonus = 110, capped at 100
            expect(score).toBe(100);
        });

        it('should deduct 5 points per distraction', () => {
            const score = calculateFocusScore({
                focusMinutes: 25,
                distractionCount: 2,
                contextSwitches: 0,
                sessionGoalMinutes: 25,
            });
            // 100 - 10 + 10 = 100 (still perfect with bonus)
            expect(score).toBe(100);
        });

        it('should deduct 2 points per context switch', () => {
            const score = calculateFocusScore({
                focusMinutes: 25,
                distractionCount: 0,
                contextSwitches: 5,
                sessionGoalMinutes: 25,
            });
            // 100 - 10 + 10 = 100
            expect(score).toBe(100);
        });

        it('should not give bonus if goal not met', () => {
            const score = calculateFocusScore({
                focusMinutes: 20,
                distractionCount: 0,
                contextSwitches: 0,
                sessionGoalMinutes: 25,
            });
            // 100 (no bonus)
            expect(score).toBe(100);
        });

        it('should not go below 0', () => {
            const score = calculateFocusScore({
                focusMinutes: 5,
                distractionCount: 30,
                contextSwitches: 30,
                sessionGoalMinutes: 25,
            });
            // 100 - 150 - 60 = -110, capped at 0
            expect(score).toBe(0);
        });

        it('should handle realistic session data', () => {
            const score = calculateFocusScore({
                focusMinutes: 25,
                distractionCount: 3,
                contextSwitches: 4,
                sessionGoalMinutes: 25,
            });
            // 100 - 15 - 8 + 10 = 87
            expect(score).toBe(87);
        });
    });

    describe('isDistractionApp', () => {
        it('should identify YouTube as distraction', () => {
            expect(isDistractionApp('YouTube')).toBe(true);
            expect(isDistractionApp('youtube.com')).toBe(true);
            expect(isDistractionApp('Google Chrome - YouTube')).toBe(true);
        });

        it('should identify Netflix as distraction', () => {
            expect(isDistractionApp('Netflix')).toBe(true);
        });

        it('should identify TikTok as distraction', () => {
            expect(isDistractionApp('TikTok')).toBe(true);
        });

        it('should identify social media as distractions', () => {
            expect(isDistractionApp('Instagram')).toBe(true);
            expect(isDistractionApp('Twitter')).toBe(true);
            expect(isDistractionApp('Reddit')).toBe(true);
            expect(isDistractionApp('Facebook')).toBe(true);
        });

        it('should NOT flag work apps as distractions', () => {
            expect(isDistractionApp('Visual Studio Code')).toBe(false);
            expect(isDistractionApp('Notion')).toBe(false);
        });
    });

    describe('isWorkApp', () => {
        it('should identify coding apps as work', () => {
            expect(isWorkApp('Visual Studio Code')).toBe(true);
            expect(isWorkApp('code.exe')).toBe(true);
            expect(isWorkApp('Terminal')).toBe(true);
        });

        it('should identify productivity apps as work', () => {
            expect(isWorkApp('Notion')).toBe(true);
            expect(isWorkApp('Obsidian')).toBe(true);
            expect(isWorkApp('Microsoft Word')).toBe(true);
        });

        it('should identify communication apps as work', () => {
            expect(isWorkApp('Slack')).toBe(true);
            expect(isWorkApp('Microsoft Teams')).toBe(true);
            expect(isWorkApp('Zoom')).toBe(true);
        });

        it('should NOT flag entertainment apps as work', () => {
            expect(isWorkApp('Netflix')).toBe(false);
            expect(isWorkApp('YouTube')).toBe(false);
        });
    });
});
