import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Activity, Calendar, Target, Play, Pause, BarChart3 } from 'lucide-react';
export default function TraderDashboard() {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStart, setSessionStart] = useState(null);
    const [sessionTime, setSessionTime] = useState(0);
    const [pnl, setPnl] = useState(0);
    const [trades, setTrades] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [marketStatus, setMarketStatus] = useState([]);
    useEffect(() => {
        updateMarketStatus();
        const interval = setInterval(updateMarketStatus, 60000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        let interval;
        if (isSessionActive && sessionStart) {
            interval = setInterval(() => {
                setSessionTime(Math.floor((Date.now() - sessionStart.getTime()) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, sessionStart]);
    const updateMarketStatus = () => {
        const now = new Date();
        const hour = now.getUTCHours();
        const day = now.getUTCDay();
        const isWeekend = day === 0 || day === 6;
        const nyseOpen = hour >= 14 && hour < 21 && !isWeekend;
        const lseOpen = hour >= 8 && hour < 17 && !isWeekend;
        setMarketStatus([
            { market: 'NYSE/NASDAQ', status: nyseOpen ? 'open' : isWeekend ? 'closed' : hour < 14 ? 'premarket' : 'afterhours' },
            { market: 'London (LSE)', status: lseOpen ? 'open' : 'closed' },
            { market: 'Crypto', status: 'open' },
        ]);
    };
    const startSession = () => {
        setIsSessionActive(true);
        setSessionStart(new Date());
        setSessionTime(0);
        setPnl(0);
        setTrades(0);
    };
    const endSession = () => {
        if (sessionStart) {
            const newSession = {
                id: Date.now(),
                startTime: sessionStart.toISOString(),
                endTime: new Date().toISOString(),
                pnl,
                trades,
                notes: '',
            };
            setSessions(prev => [newSession, ...prev]);
        }
        setIsSessionActive(false);
        setSessionStart(null);
        setSessionTime(0);
    };
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    const weeklyPnL = sessions.reduce((sum, s) => sum + s.pnl, 0) + pnl;
    const weeklyTrades = sessions.reduce((sum, s) => sum + s.trades, 0) + trades;
    const winRate = sessions.length > 0
        ? Math.round((sessions.filter(s => s.pnl > 0).length / sessions.length) * 100)
        : 0;
    return (<div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <TrendingUp className="w-7 h-7 text-primary-400"/>
                        Trader Dashboard
                    </h1>
                    <p className="text-dark-400">Track your trading sessions and performance</p>
                </div>

                <button onClick={isSessionActive ? endSession : startSession} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isSessionActive
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
            : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
                    {isSessionActive ? (<>
                            <Pause className="w-5 h-5"/>
                            End Session
                        </>) : (<>
                            <Play className="w-5 h-5"/>
                            Start Trading Session
                        </>)}
                </button>
            </div>

            {isSessionActive && (<div className="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse"/>
                        <span className="text-white font-medium">Trading Session Active</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-2xl font-mono text-white">{formatTime(sessionTime)}</div>
                            <div className="text-xs text-dark-400">Duration</div>
                        </div>
                        <div className="text-center">
                            <input type="number" value={pnl} onChange={(e) => setPnl(parseFloat(e.target.value) || 0)} className="w-24 bg-dark-800 border border-dark-600 rounded px-2 py-1 text-center text-xl font-mono text-white" placeholder="P&L"/>
                            <div className="text-xs text-dark-400">P&L ($)</div>
                        </div>
                        <div className="text-center">
                            <input type="number" value={trades} onChange={(e) => setTrades(parseInt(e.target.value) || 0)} className="w-16 bg-dark-800 border border-dark-600 rounded px-2 py-1 text-center text-xl font-mono text-white"/>
                            <div className="text-xs text-dark-400">Trades</div>
                        </div>
                    </div>
                </div>)}

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${weeklyPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {weeklyPnL >= 0 ? (<TrendingUp className="w-5 h-5 text-green-400"/>) : (<TrendingDown className="w-5 h-5 text-red-400"/>)}
                        </div>
                        <span className="text-dark-400 text-sm">Weekly P&L</span>
                    </div>
                    <div className={`text-2xl font-bold ${weeklyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {weeklyPnL >= 0 ? '+' : ''}${weeklyPnL.toFixed(2)}
                    </div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-400"/>
                        </div>
                        <span className="text-dark-400 text-sm">Total Trades</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{weeklyTrades}</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Target className="w-5 h-5 text-purple-400"/>
                        </div>
                        <span className="text-dark-400 text-sm">Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{winRate}%</div>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-yellow-400"/>
                        </div>
                        <span className="text-dark-400 text-sm">Sessions</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{sessions.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-400"/>
                        Market Status
                    </h2>
                    <div className="space-y-3">
                        {marketStatus.map((m, i) => (<div key={i} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                                <span className="text-white">{m.market}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${m.status === 'open' ? 'bg-green-500/20 text-green-400' :
                m.status === 'premarket' ? 'bg-yellow-500/20 text-yellow-400' :
                    m.status === 'afterhours' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'}`}>
                                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                                </span>
                            </div>))}
                    </div>
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-400"/>
                        Recent Sessions
                    </h2>
                    {sessions.length === 0 ? (<p className="text-dark-400 text-center py-8">No sessions yet</p>) : (<div className="space-y-2 max-h-48 overflow-auto">
                            {sessions.slice(0, 5).map((session) => (<div key={session.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                                    <div>
                                        <div className="text-sm text-white">
                                            {new Date(session.startTime).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-dark-400">{session.trades} trades</div>
                                    </div>
                                    <div className={`text-lg font-semibold ${session.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {session.pnl >= 0 ? '+' : ''}${session.pnl.toFixed(2)}
                                    </div>
                                </div>))}
                        </div>)}
                </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400"/>
                <div>
                    <div className="font-medium text-yellow-400">Risk Management Tip</div>
                    <div className="text-sm text-dark-300">
                        Set a daily loss limit. If you hit it, step away and review.
                    </div>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=TraderDashboard.js.map