import React from 'react';
import { formatDate } from '@/lib/utils';

interface InsiderTransaction {
    name: string;
    share: number;
    change: number;
    filingDate: string;
    transactionDate: string;
    transactionPrice: number;
    symbol: string;
}

interface InsiderTransactionsProps {
    transactions: InsiderTransaction[];
    showSymbol?: boolean;
}

const InsiderTransactions: React.FC<InsiderTransactionsProps> = ({ transactions, showSymbol = false }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-lg text-white p-6">
                <h3 className="text-lg font-semibold mb-4">Insider Transactions</h3>
                <p className="text-gray-400">No recent insider trading activity found.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg text-white">
            <div className="p-6 border-b border-gray-800">
                <h3 className="text-lg font-semibold">Insider Transactions</h3>
            </div>
            <div className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                {showSymbol && <th className="px-4 py-3">Symbol</th>}
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3 text-right">Shares</th>
                                <th className="px-4 py-3 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice(0, 50).map((t, idx) => {
                                const isBuy = t.change > 0;
                                const value = Math.abs(t.change * t.transactionPrice);

                                return (
                                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-4 py-3">{t.transactionDate}</td>
                                        {showSymbol && <td className="px-4 py-3 font-bold text-yellow-500">{t.symbol}</td>}
                                        <td className="px-4 py-3 font-medium">{t.name}</td>
                                        <td className={`px-4 py-3 ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                            {isBuy ? 'Buy' : 'Sell'}
                                        </td>
                                        <td className="px-4 py-3 text-right">{t.change.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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

export default InsiderTransactions;
