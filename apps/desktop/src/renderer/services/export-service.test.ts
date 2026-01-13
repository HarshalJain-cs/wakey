import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    exportToCSV,
    exportToJSON,
    formatDate,
    downloadFile,
} from '../services/export-service';

describe('Export Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-01-15T10:30:00');
            const result = formatDate(date);
            expect(result).toContain('2024');
            expect(result).toContain('01');
            expect(result).toContain('15');
        });
    });

    describe('exportToCSV', () => {
        it('should create valid CSV content', () => {
            const data = [
                { name: 'Task 1', duration: 30 },
                { name: 'Task 2', duration: 45 },
            ];
            const csv = exportToCSV(data, ['name', 'duration']);
            expect(csv).toContain('name,duration');
            expect(csv).toContain('Task 1,30');
            expect(csv).toContain('Task 2,45');
        });

        it('should handle empty data', () => {
            const csv = exportToCSV([], ['name', 'duration']);
            expect(csv).toContain('name,duration');
        });

        it('should escape special characters', () => {
            const data = [{ name: 'Task, with comma', value: '"quoted"' }];
            const csv = exportToCSV(data, ['name', 'value']);
            expect(csv).toContain('"Task, with comma"');
        });
    });

    describe('exportToJSON', () => {
        it('should create valid JSON content', () => {
            const data = { tasks: [1, 2, 3], settings: { theme: 'dark' } };
            const json = exportToJSON(data);
            const parsed = JSON.parse(json);
            expect(parsed.tasks).toEqual([1, 2, 3]);
            expect(parsed.settings.theme).toBe('dark');
        });

        it('should include metadata', () => {
            const data = { value: 'test' };
            const json = exportToJSON(data);
            const parsed = JSON.parse(json);
            expect(parsed).toHaveProperty('exportedAt');
            expect(parsed).toHaveProperty('version');
        });
    });

    describe('downloadFile', () => {
        it('should create and trigger download', () => {
            const createElementSpy = vi.spyOn(document, 'createElement');
            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            const removeChildSpy = vi.spyOn(document.body, 'removeChild');

            const mockLink = {
                href: '',
                download: '',
                click: vi.fn(),
            };
            createElementSpy.mockReturnValue(mockLink as unknown as HTMLElement);

            downloadFile('test content', 'test.txt', 'text/plain');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(mockLink.download).toBe('test.txt');
            expect(mockLink.click).toHaveBeenCalled();
        });
    });
});
