/**
 * @fileoverview Pagination Utilities for Wakey
 * 
 * Provides generic pagination helpers for handling large datasets.
 * 
 * @module utils/pagination
 */

// ============================================
// Types
// ============================================

/**
 * Pagination parameters for offset-based pagination.
 */
export interface OffsetPaginationParams {
    page: number;
    pageSize: number;
}

/**
 * Pagination parameters for cursor-based pagination.
 */
export interface CursorPaginationParams {
    cursor?: string;
    limit: number;
}

/**
 * Paginated result with metadata.
 */
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

/**
 * Cursor-based paginated result.
 */
export interface CursorPaginatedResult<T> {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
}

// ============================================
// Offset Pagination
// ============================================

/**
 * Creates default pagination parameters.
 */
export function createPaginationParams(
    page = 1,
    pageSize = 20
): OffsetPaginationParams {
    return {
        page: Math.max(1, page),
        pageSize: Math.min(100, Math.max(1, pageSize)),
    };
}

/**
 * Paginates an array of items using offset-based pagination.
 * 
 * @param items - Full array of items to paginate
 * @param params - Pagination parameters
 * @returns Paginated result with metadata
 * 
 * @example
 * const result = paginate(activities, { page: 2, pageSize: 10 });
 * console.log(result.data); // Items 10-19
 * console.log(result.pagination.totalPages); // Total page count
 */
export function paginate<T>(
    items: T[],
    params: OffsetPaginationParams
): PaginatedResult<T> {
    const { page, pageSize } = createPaginationParams(params.page, params.pageSize);
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
        data: items.slice(start, end),
        pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

// ============================================
// Cursor Pagination
// ============================================

/**
 * Creates a cursor from an item (typically using ID or timestamp).
 */
export function createCursor(item: { id: number | string } | { created_at: string }): string {
    if ('id' in item) {
        return Buffer.from(String(item.id)).toString('base64');
    }
    if ('created_at' in item) {
        return Buffer.from(item.created_at).toString('base64');
    }
    return '';
}

/**
 * Decodes a cursor to its original value.
 */
export function decodeCursor(cursor: string): string {
    try {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    } catch {
        return '';
    }
}

/**
 * Paginates items using cursor-based pagination.
 * 
 * @param items - Items sorted by cursor field (id or timestamp)
 * @param params - Cursor pagination parameters
 * @param getCursor - Function to extract cursor from item
 * @returns Cursor-paginated result
 */
export function cursorPaginate<T>(
    items: T[],
    params: CursorPaginationParams,
    getCursor: (item: T) => string
): CursorPaginatedResult<T> {
    const { cursor, limit } = params;
    const safeLimit = Math.min(100, Math.max(1, limit));

    let startIndex = 0;
    if (cursor) {
        const decodedCursor = decodeCursor(cursor);
        startIndex = items.findIndex(item => getCursor(item) === decodedCursor) + 1;
        if (startIndex === 0) startIndex = 0; // Not found, start from beginning
    }

    const data = items.slice(startIndex, startIndex + safeLimit);
    const hasMore = startIndex + safeLimit < items.length;
    const nextCursor = hasMore && data.length > 0
        ? createCursor({ id: getCursor(data[data.length - 1]) })
        : null;

    return { data, nextCursor, hasMore };
}

// ============================================
// Helpers
// ============================================

/**
 * Calculates page range for pagination UI.
 * Returns an array of page numbers to display.
 * 
 * @param currentPage - Current active page
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum page numbers to show
 */
export function getPageRange(
    currentPage: number,
    totalPages: number,
    maxVisible = 5
): number[] {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
