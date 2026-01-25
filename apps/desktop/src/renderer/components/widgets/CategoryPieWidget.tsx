import { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react';
import { AnimatedPieChart } from '../charts';

interface CategoryData {
    name: string;
    minutes: number;
}

export default function CategoryPieWidget() {
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        if (!window.wakey?.getCategoryBreakdown) {
            setLoading(false);
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await window.wakey.getCategoryBreakdown(today, today);
            setCategoryData(data);
        } catch (error) {
            console.error('Failed to load category data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalMinutes = categoryData.reduce((sum, c) => sum + c.minutes, 0);

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                    <PieChart className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Categories</h3>
                    <p className="text-xs text-dark-400">Today's breakdown</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                </div>
            ) : categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-dark-500 text-sm">
                    No activity yet
                </div>
            ) : (
                <>
                    <div className="h-36">
                        <AnimatedPieChart
                            data={categoryData.map(c => ({
                                name: c.name,
                                value: c.minutes,
                            }))}
                            height={140}
                            innerRadius={30}
                            showLegend={false}
                        />
                    </div>
                    <div className="mt-2 text-center">
                        <span className="text-lg font-bold text-white">{formatTime(totalMinutes)}</span>
                        <span className="text-dark-400 text-sm ml-1">total</span>
                    </div>
                </>
            )}
        </div>
    );
}
