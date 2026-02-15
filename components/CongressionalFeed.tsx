import React from 'react';


interface CongressionalTrade {
    symbol: string;
    filingDate: string;
    transactionDate: string;
    transactionType: string;
    amount: number;
    owner: string;
    representative: string;
    party?: string;
    district?: string;
    state?: string;
}

interface CongressionalFeedProps {
    trades: CongressionalTrade[];
}

const CongressionalFeed: React.FC<CongressionalFeedProps> = ({ trades }) => {
    if (!trades || trades.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg text-white p-6 mt-8">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Congressional Trading 🏛️</h3>
                <p className="text-gray-400">No recent congressional trading activity found.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg text-white mt-8">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-400">Congressional Trading 🏛️</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider">US Congress</span>
            </div>
            <div className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Representative</th>
                                <th className="px-4 py-3">Party/State</th>
                                <th className="px-4 py-3">Symbol</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3 text-right">Amount (Est.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.slice(0, 20).map((t, idx) => {
                                const isPurchase = t.transactionType?.toLowerCase().includes('purchase');
                                const isSale = t.transactionType?.toLowerCase().includes('sale');
                                const typeColor = isPurchase ? 'text-green-500' : isSale ? 'text-red-500' : 'text-gray-400';

                                return (
                                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-4 py-3">{t.transactionDate}</td>
                                        <td className="px-4 py-3 font-medium">{t.representative}</td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {t.party ? `${t.party} - ${t.state}` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-blue-300">{t.symbol}</td>
                                        <td className={`px-4 py-3 ${typeColor}`}>
                                            {t.transactionType}
                                        </td>
                                        <td className="px-4 py-3 text-right">${t.amount?.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CongressionalFeed;
