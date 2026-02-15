import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface IPortfolio extends Document {
    userId: string;
    symbol: string;
    totalQuantity: number;
    averagePrice: number;
}

const PortfolioSchema = new Schema<IPortfolio>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true },
        totalQuantity: { type: Number, required: true, min: 0 },
        averagePrice: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
);

// Compound index to ensure unique symbol per user
PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Portfolio: Model<IPortfolio> = (models?.Portfolio as Model<IPortfolio>) || model<IPortfolio>('Portfolio', PortfolioSchema);
