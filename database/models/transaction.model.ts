import { Schema, model, models, type Document, type Model } from 'mongoose';

export type TransactionType = 'BUY' | 'SELL';

export interface ITransaction extends Document {
    userId: string;
    symbol: string;
    type: TransactionType;
    quantity: number;
    price: number;
    totalAmount: number;
    date: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true },
        type: { type: String, enum: ['BUY', 'SELL'], required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Transaction: Model<ITransaction> = (models?.Transaction as Model<ITransaction>) || model<ITransaction>('Transaction', TransactionSchema);
