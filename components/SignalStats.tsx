import React from 'react';

// Define the transaction interface explicitly to avoid import issues
interface InsiderTransaction {
    change: number;
    transactionPrice: number;
    transactionDate: string;
    // other fields ignored
}

interface SignalStatsProps {
    transactions: any[]; // Use any to be flexible or duplicate the interface
}

const SignalStats: React.FC<SignalStatsProps> = ({ transactions }) => {
    // Calculate totals
    let totalBuyVal = 0;
    let totalSellVal = 0;
    let buyCount = 0;
    let sellCount = 0;

    if (!transactions) return null;

    transactions.forEach(t => {
        // change is positive for buy, usually. But Finnhub might use transactionCode. 
        // Based on logic in InsiderTransactions: change > 0 is buy.
        const val = Math.abs(t.change * t.transactionPrice);
        if (t.change > 0) {
            totalBuyVal += val;
            buyCount++;
        } else {
            totalSellVal += val;
            sellCount++;
        }
    });

    const totalVal = totalBuyVal + totalSellVal;
    const buyPercentage = totalVal > 0 ? (totalBuyVal / totalVal) * 100 : 0;
    const sellPercentage = totalVal > 0 ? (totalSellVal / totalVal) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Volume Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Volume (Recent)</h3>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">${(totalVal / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full mt-4 flex overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${buyPercentage}%` }}></div>
                        <div className="bg-red-500 h-full" style={{ width: `${sellPercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-2 text-gray-400">
                        <span className="text-green-400">Buys: {buyPercentage.toFixed(0)}%</span>
                        <span className="text-red-400">Sells: {sellPercentage.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Sentiment Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Market Sentiment</h3>
                <div>
                    <span className={`text-2xl font-bold ${buyPercentage > 60 ? 'text-green-500' : buyPercentage < 40 ? 'text-red-500' : 'text-yellow-500'}`}>
                        {buyPercentage > 60 ? 'Bullish Accumulation' : buyPercentage < 40 ? 'Bearish Offloading' : 'Mixed / Neutral'}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                        {buyPercentage > 60
                            ? "Insiders are aggressively buying shares."
                            : buyPercentage < 40
                                ? "Insiders are selling more than buying."
                                : "Balanced buying and selling activity."}
                    </p>
                </div>
            </div>

            {/* Activity Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Transaction Count</h3>
                <div className="flex items-end gap-8">
                    <div>
                        <span className="text-4xl font-bold text-green-500">{buyCount}</span>
                        <p className="text-xs text-gray-500 uppercase mt-1">Buys</p>
                    </div>
                    <div>
                        <span className="text-4xl font-bold text-red-500">{sellCount}</span>
                        <p className="text-xs text-gray-500 uppercase mt-1">Sells</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignalStats;
