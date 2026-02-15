import React from 'react';
import { getWatchlist } from '@/lib/actions/watchlist.actions';
import { getStockPrice } from '@/lib/actions/trade.actions';
import WatchlistButton from '@/components/WatchlistButton';
import Link from 'next/link';

export default async function WatchlistPage() {
    const watchlistItems = await getWatchlist();

    // Fetch current price for each item
    const watchlistWithPrices = await Promise.all(watchlistItems.map(async (item: any) => {
        const currentPrice = await getStockPrice(item.symbol);
        return {
            ...item,
            currentPrice
        };
    }));

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

            {watchlistWithPrices.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl mb-4">Your watchlist is empty.</p>
                    <Link href="/search" className="text-blue-400 hover:underline">Search for stocks to add</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchlistWithPrices.map((item: any) => (
                        <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-yellow-500">{item.symbol}</h2>
                                    <p className="text-sm text-gray-400">Added on {new Date(item.addedAt).toLocaleDateString()}</p>
                                </div>
                                <WatchlistButton
                                    symbol={item.symbol}
                                    company={item.symbol} // Simplified
                                    isInWatchlist={true}
                                    type="icon"
                                />
                            </div>

                            <div className="mt-4">
                                <span className="text-gray-400">Current Price</span>
                                <div className="text-3xl font-bold">
                                    ${item.currentPrice?.toFixed(2) || '---'}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href={`/stocks/${item.symbol}`}
                                    className="block w-full text-center bg-gray-800 hover:bg-gray-700 py-2 rounded text-white transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
