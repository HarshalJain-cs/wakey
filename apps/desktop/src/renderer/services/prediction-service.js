// Focus Prediction Service
// Analyzes historical data to predict optimal focus times
// ==========================================
// State
// ==========================================
let historicalData = [];
let predictions = new Map();
// ==========================================
// Data Collection
// ==========================================
export async function loadHistoricalData() {
    try {
        const settings = await window.wakey.getSettings();
        const saved = settings.focusHistory;
        if (saved && Array.isArray(saved)) {
            historicalData = saved;
        }
    }
    catch (error) {
        console.error('Failed to load historical data:', error);
    }
}
export async function recordSession(focusMinutes, distractions, quality) {
    const entry = {
        timestamp: new Date().toISOString(),
        focusMinutes,
        distractions,
        quality,
    };
    historicalData.push(entry);
    // Keep last 30 days of data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    historicalData = historicalData.filter(d => new Date(d.timestamp).getTime() > thirtyDaysAgo);
    // Save to settings
    await window.wakey.setSetting('focusHistory', historicalData);
    // Recalculate predictions
    calculatePredictions();
}
// ==========================================
// Prediction Algorithm
// ==========================================
function calculatePredictions() {
    predictions.clear();
    // Group data by hour and day
    const hourDayData = new Map();
    for (const entry of historicalData) {
        const date = new Date(entry.timestamp);
        const hour = date.getHours();
        const day = date.getDay();
        const key = `${day}-${hour}`;
        const existing = hourDayData.get(key) || { total: 0, count: 0, quality: 0 };
        existing.total += entry.focusMinutes;
        existing.count += 1;
        existing.quality += entry.quality;
        hourDayData.set(key, existing);
    }
    // Calculate predictions
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const key = `${day}-${hour}`;
            const data = hourDayData.get(key);
            let score = 50; // Default
            let confidence = 0;
            if (data && data.count > 0) {
                const avgQuality = data.quality / data.count;
                const avgMinutes = data.total / data.count;
                // Score based on both quality and duration
                score = Math.min(100, Math.max(0, (avgQuality * 0.6) + (Math.min(avgMinutes / 60, 1) * 40)));
                // Confidence based on sample size
                confidence = Math.min(1, data.count / 10);
            }
            predictions.set(key, {
                hour,
                dayOfWeek: day,
                score,
                confidence,
            });
        }
    }
}
// ==========================================
// Public API
// ==========================================
export function getPrediction(day, hour) {
    const key = `${day}-${hour}`;
    return predictions.get(key) || {
        hour,
        dayOfWeek: day,
        score: 50,
        confidence: 0,
    };
}
export function getBestFocusTimes(count = 5) {
    const all = Array.from(predictions.values());
    return all
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}
export function getCurrentPrediction() {
    const now = new Date();
    return getPrediction(now.getDay(), now.getHours());
}
export function getNextBestFocusTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // Look ahead 48 hours
    let best = null;
    let bestDay = currentDay;
    let foundAfterNow = false;
    for (let offset = 0; offset < 48; offset++) {
        const targetHour = (currentHour + offset) % 24;
        const targetDay = (currentDay + Math.floor((currentHour + offset) / 24)) % 7;
        // Skip current hour
        if (offset === 0)
            continue;
        const pred = getPrediction(targetDay, targetHour);
        if (!best || pred.score > best.score) {
            best = pred;
            bestDay = targetDay;
            foundAfterNow = true;
        }
    }
    if (best && foundAfterNow) {
        return {
            hour: best.hour,
            day: dayNames[bestDay],
            score: best.score,
        };
    }
    return null;
}
export function analyzeFocusPatterns() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // Analyze by hour
    const hourScores = new Array(24).fill(0);
    const hourCounts = new Array(24).fill(0);
    for (const entry of historicalData) {
        const hour = new Date(entry.timestamp).getHours();
        hourScores[hour] += entry.quality;
        hourCounts[hour] += 1;
    }
    // Find best hours
    const hourAvgs = hourScores.map((score, i) => hourCounts[i] > 0 ? score / hourCounts[i] : 0);
    const sortedHours = hourAvgs
        .map((avg, hour) => ({ hour, avg }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
        .map(h => h.hour);
    // Analyze by day
    const dayScores = new Array(7).fill(0);
    const dayCounts = new Array(7).fill(0);
    for (const entry of historicalData) {
        const day = new Date(entry.timestamp).getDay();
        dayScores[day] += entry.quality;
        dayCounts[day] += 1;
    }
    const dayAvgs = dayScores.map((score, i) => dayCounts[i] > 0 ? score / dayCounts[i] : 0);
    const sortedDays = dayAvgs
        .map((avg, day) => ({ day, avg }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
        .map(d => dayNames[d.day]);
    // Average session length
    const totalMinutes = historicalData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const avgSession = historicalData.length > 0
        ? Math.round(totalMinutes / historicalData.length)
        : 25;
    // Peak times
    const peakHour = sortedHours[0] || 9;
    const peakTime = `${peakHour.toString().padStart(2, '0')}:00`;
    // Distraction peak (inverse of quality)
    const worstHour = hourAvgs
        .map((avg, hour) => ({ hour, avg }))
        .filter(h => h.avg > 0)
        .sort((a, b) => a.avg - b.avg)[0]?.hour || 14;
    const distractionPeak = `${worstHour.toString().padStart(2, '0')}:00`;
    return {
        bestHours: sortedHours,
        bestDays: sortedDays,
        averageSessionLength: avgSession,
        peakProductivityTime: peakTime,
        distractionPeakTime: distractionPeak,
    };
}
// ==========================================
// Initialize
// ==========================================
export async function initialize() {
    await loadHistoricalData();
    calculatePredictions();
}
//# sourceMappingURL=prediction-service.js.map