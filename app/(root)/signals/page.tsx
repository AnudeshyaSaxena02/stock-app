import React from 'react';
import { getInsiderTransactions, getCongressionalTrading } from '@/lib/actions/finnhub.actions';
import InsiderTransactions from '@/components/InsiderTransactions';
import SignalStats from '@/components/SignalStats';
import CongressionalFeed from '@/components/CongressionalFeed';

// Select a subset of popular stocks for the feed to avoid rate limits and ensure relevance
const SIGNAL_FEED_SYMBOLS = [
    'AAPL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'GOOGL', 'NFLX', 'AMD', 'INTC'
];

export default async function SignalsPage() {
    // Fetch insider transactions for multiple stocks in parallel
    const transactionsPromises = SIGNAL_FEED_SYMBOLS.map(async (symbol) => {
        const data = await getInsiderTransactions(symbol);
        return data.map((t: any) => ({ ...t, symbol })); // Ensure symbol is attached
    });

    const [insiderDataArrays, congressionalData] = await Promise.all([
        Promise.all(transactionsPromises),
        getCongressionalTrading()
    ]);

    // Flatten and sort by date (newest first)
    const allTransactions = insiderDataArrays
        .flat()
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 50); // Keep top 50

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-yellow-500 mb-2">Insider Signal Feed </h1>
                <p className="text-gray-400">
                    Real-time tracking of significant insider trading activity from top tech companies.
                    See when CEOs and executives are buying or selling.
                </p>
            </div>

            <SignalStats transactions={allTransactions} />

            <div className="grid grid-cols-1 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Corporate Insiders</h2>
                    <InsiderTransactions transactions={allTransactions} showSymbol={true} />
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Congressional Trading</h2>
                    <CongressionalFeed trades={congressionalData} />
                </div>
            </div>
        </div>
    );
}
