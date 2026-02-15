import React from 'react';
import { getUserBalance, getPortfolio, getTransactions, getStockPrice } from '@/lib/actions/trade.actions';
import { redirect } from 'next/navigation';

export default async function PortfolioPage() {
    const balance = await getUserBalance();
    const rawPortfolio = await getPortfolio();
    const transactions = await getTransactions();

    // If balance is null, it means user is not logged in or error
    // We can redirect to login or show a message
    if (balance === null) {
        // For now, simple text, or redirect
        // redirect('/sign-in'); // Assuming sign-in route exists
        return <div className="p-8 text-black">Please sign in to view your portfolio.</div>;
    }

    // Fetch current prices and calculate P&L
    const portfolio = await Promise.all(rawPortfolio.map(async (item: any) => {
        const currentPrice = await getStockPrice(item.symbol) || item.averagePrice; // Fallback to avg price if fetch fails
        const currentValue = currentPrice * item.totalQuantity;
        const totalCost = item.averagePrice * item.totalQuantity;
        const profitLoss = currentValue - totalCost;
        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

        return {
            ...item,
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercent
        };
    }));

    const totalCostBasis = portfolio.reduce((acc, item) => acc + (item.averagePrice * item.totalQuantity), 0);
    const totalCurrentValue = portfolio.reduce((acc, item) => acc + item.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalCostBasis;
    const totalProfitLossPercent = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <h1 className="text-3xl font-bold mb-8">My Portfolio (Paper Trading)</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-gray-400 mb-2">Available Balance</h2>
                    <p className="text-4xl font-bold text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-gray-400 mb-2">Total Portfolio Value</h2>
                    <p className="text-4xl font-bold text-white">${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <div className={`text-sm mt-2 font-medium ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({totalProfitLossPercent.toFixed(2)}%)
                    </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-gray-400 mb-2">Total Equity (Bal + Port)</h2>
                    <p className="text-4xl font-bold text-yellow-400">${(balance + totalCurrentValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Current Holdings</h2>
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="p-4">Symbol</th>
                                <th className="p-4">Qty</th>
                                <th className="p-4">Avg. Price</th>
                                <th className="p-4">Current Price</th>
                                <th className="p-4">Current Value</th>
                                <th className="p-4">P&L</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {portfolio.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-gray-500">No holdings yet. Go trade some stocks!</td>
                                </tr>
                            ) : (
                                portfolio.map((item: any) => (
                                    <tr key={item._id} className="hover:bg-gray-800/50">
                                        <td className="p-4 font-bold text-yellow-500">{item.symbol}</td>
                                        <td className="p-4">{item.totalQuantity}</td>
                                        <td className="p-4">${item.averagePrice.toFixed(2)}</td>
                                        <td className="p-4">${item.currentPrice.toFixed(2)}</td>
                                        <td className="p-4">${item.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className={`p-4 font-bold ${item.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {item.profitLoss >= 0 ? '+' : ''}{item.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br />
                                            <span className="text-xs font-normal">({item.profitLossPercent.toFixed(2)}%)</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <a href={`/stocks/${item.symbol}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">Trade</a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Symbol</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-gray-500">No transactions tracking.</td>
                                </tr>
                            ) : (
                                transactions.map((tx: any) => (
                                    <tr key={tx._id} className="hover:bg-gray-800/50">
                                        <td className="p-4 text-sm text-gray-400">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                                        <td className="p-4 font-bold">{tx.symbol}</td>
                                        <td className={`p-4 font-semibold ${tx.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</td>
                                        <td className="p-4">{tx.quantity}</td>
                                        <td className="p-4">${tx.price.toFixed(2)}</td>
                                        <td className="p-4">${tx.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
