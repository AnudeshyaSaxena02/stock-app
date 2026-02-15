'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { executeTrade, getUserBalance, getStockPrice } from '@/lib/actions/trade.actions';
import { useSession } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/client';
// Note: better-auth client usage might vary. 
// Assuming checking session roughly or falling back to server check.
// Actually, for simplicity, we will disable the button if not logged in or handle it in executeTrade.

interface TradeModalProps {
    symbol: string;
}

export function TradeModal({ symbol }: TradeModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [holdings, setHoldings] = useState<number>(0);

    // Fetch price from Server Action (avoids CORS)
    const fetchPrice = async () => {
        const currentPrice = await getStockPrice(symbol);
        if (currentPrice !== null) {
            setPrice(currentPrice);
        }
    };

    // Fetch Balance
    const fetchBalance = async () => {
        const bal = await getUserBalance();
        setBalance(bal);
    };

    useEffect(() => {
        if (isOpen) {
            fetchPrice();
            fetchBalance();
            // Polling price every 10s
            const interval = setInterval(fetchPrice, 10000);
            return () => clearInterval(interval);
        }
    }, [isOpen, symbol]);

    const handleTrade = async () => {
        if (!price) {
            toast.error('Price not available');
            return;
        }

        setLoading(true);

        const result = await executeTrade({
            symbol,
            type,
            quantity: Number(quantity),
            currentPrice: price,
        });

        setLoading(false);

        if (result.success) {
            toast.success(`${type} Successful!`);
            setIsOpen(false);
        } else {
            toast.error(result.error || 'Trade failed');
        }
    };

    const estimatedTotal = price ? (price * quantity).toFixed(2) : '---';

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                    Trade {symbol}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle>Trade {symbol}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Current Price: ${price?.toFixed(2) || 'Loading...'} | Balance: ${balance?.toLocaleString() || '---'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant={type === 'BUY' ? 'default' : 'outline'}
                            onClick={() => setType('BUY')}
                            className={type === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600 text-gray-300'}
                        >
                            Buy
                        </Button>
                        <Button
                            variant={type === 'SELL' ? 'default' : 'outline'}
                            onClick={() => setType('SELL')}
                            className={type === 'SELL' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-600 text-gray-300'}
                        >
                            Sell
                        </Button>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right text-gray-300">
                            Quantity
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="col-span-3 bg-gray-800 border-gray-700 text-white"
                            min="1"
                        />
                    </div>

                    <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-xl font-bold">${estimatedTotal}</span>
                    </div>
                </div>

                <Button onClick={handleTrade} disabled={loading || !price} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Processing...' : `Confirm ${type}`}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
