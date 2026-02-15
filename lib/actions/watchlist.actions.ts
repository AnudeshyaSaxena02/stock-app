'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { User } from '@/database/models/user.model';

// Helper to get current user ID
async function getUserId() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session?.user?.id;
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];
    try {
        await connectToDatabase();
        // Find user by email to get ID (or use session if available)
        const user = await User.findOne({ email });
        if (!user) return [];

        const items = await Watchlist.find({ userId: user._id });
        return items.map((i) => i.symbol);
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

export async function toggleWatchlist(symbol: string) {
    try {
        const userId = await getUserId();
        if (!userId) return { success: false, error: 'Unauthorized' };

        await connectToDatabase();

        const existing = await Watchlist.findOne({ userId, symbol });

        if (existing) {
            await Watchlist.deleteOne({ _id: existing._id });
            revalidatePath('/watchlist');
            revalidatePath(`/stocks/${symbol}`);
            return { success: true, added: false };
        } else {
            await Watchlist.create({
                userId,
                symbol,
                company: symbol, // Fallback for company name
                addedAt: new Date()
            });
            revalidatePath('/watchlist');
            revalidatePath(`/stocks/${symbol}`);
            return { success: true, added: true };
        }
    } catch (error) {
        console.error('Toggle watchlist error:', error);
        return { success: false, error: 'Failed to update watchlist' };
    }
}

export async function checkWatchlistStatus(symbol: string) {
    try {
        const userId = await getUserId();
        if (!userId) return false;

        await connectToDatabase();
        const existing = await Watchlist.findOne({ userId, symbol });
        return !!existing;
    } catch (error) {
        return false;
    }
}

export async function getWatchlist() {
    try {
        const userId = await getUserId();
        if (!userId) return [];

        await connectToDatabase();
        const items = await Watchlist.find({ userId });
        return JSON.parse(JSON.stringify(items));
    } catch (error) {
        console.error('Get watchlist error:', error);
        return [];
    }
}