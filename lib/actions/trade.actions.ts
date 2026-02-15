'use server';

import { connectToDatabase } from '@/database/mongoose';
import { User } from '@/database/models/user.model';
import { Portfolio } from '@/database/models/portfolio.model';
import { Transaction } from '@/database/models/transaction.model';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export async function getUserBalance() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session || !session.user) return null;
        const userId = session.user.id; // better-auth uses user.id

        await connectToDatabase();
        const user = await User.findOne({ _id: userId });
        if (!user) return null;

        // Default to 100k if not set (for existing users)
        return user.paperBalance ?? 100000;
    } catch (error) {
        console.error('Error fetching user balance:', error);
        return null;
    }
}

export async function getPortfolio() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session || !session.user) return [];
        const userId = session.user.id;

        await connectToDatabase();
        const portfolio = await Portfolio.find({ userId });
        return JSON.parse(JSON.stringify(portfolio));
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return [];
    }
}

export async function getTransactions() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session || !session.user) return [];
        const userId = session.user.id;

        await connectToDatabase();
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        return JSON.parse(JSON.stringify(transactions));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

export async function executeTrade({
    symbol,
    type,
    quantity,
    currentPrice,
}: {
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    currentPrice: number;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session || !session.user) return { success: false, error: 'Unauthorized' };
        const userId = session.user.id;

        await connectToDatabase();

        const user = await User.findById(userId);
        if (!user) return { success: false, error: 'User not found' };

        const totalAmount = quantity * currentPrice;

        if (type === 'BUY') {
            const currentBalance = user.paperBalance ?? 100000;
            if (currentBalance < totalAmount) {
                return { success: false, error: 'Insufficient funds' };
            }

            // Update Balance
            user.paperBalance = currentBalance - totalAmount;
            await user.save();

            // Update Portfolio
            const holding = await Portfolio.findOne({ userId, symbol });
            if (holding) {
                // Calculate new average price
                const totalCost = holding.averagePrice * holding.totalQuantity + totalAmount;
                const newQuantity = holding.totalQuantity + quantity;
                holding.averagePrice = totalCost / newQuantity;
                holding.totalQuantity = newQuantity;
                await holding.save();
            } else {
                await Portfolio.create({
                    userId,
                    symbol,
                    totalQuantity: quantity,
                    averagePrice: currentPrice,
                });
            }
        } else if (type === 'SELL') {
            const holding = await Portfolio.findOne({ userId, symbol });
            if (!holding || holding.totalQuantity < quantity) {
                return { success: false, error: 'Insufficient holdings' };
            }

            // Update Balance
            const currentBalance = user.paperBalance ?? 100000;
            user.paperBalance = currentBalance + totalAmount;
            await user.save();

            // Update Portfolio
            const newQuantity = holding.totalQuantity - quantity;
            if (newQuantity === 0) {
                await Portfolio.deleteOne({ _id: holding._id });
            } else {
                holding.totalQuantity = newQuantity;
                await holding.save();
            }
        }

        // Create Transaction Record
        await Transaction.create({
            userId,
            symbol,
            type,
            quantity,
            price: currentPrice,
            totalAmount,
            date: new Date(),
        });

        revalidatePath('/portfolio');
        revalidatePath(`/stocks/${symbol}`);

        return { success: true };
    } catch (error) {
        console.error('Trade execution failed:', error);
        return { success: false, error: 'Trade failed' };
    }
}

export async function getStockPrice(symbol: string) {
    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`, {
            cache: 'no-store'
        });
        const data = await res.json();
        const currentPrice = data.chart.result[0].meta.regularMarketPrice;
        return currentPrice;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
    }
}
