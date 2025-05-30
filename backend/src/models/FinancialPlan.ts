import mongoose, { Document, Schema } from "mongoose";
import { DistributionSchema, IDistribution } from "./Distribution";
import { IInvestmentType, investmentTypeSchema } from "./InvestmentType";

// Investments individual to Financial Plan (Unlike InvestmentType)
export interface IInvestment extends Document {
    investmentType: string;
    value: number;
    taxStatus: "non-retirement" | "pre-tax" | "after-tax";
    id: string
}

const InvestmentSchema = new Schema<IInvestment>({
    investmentType: { type: String, required: true },
    value: { type: Number, required: true },
    taxStatus: { type: String, enum: ["non-retirement", "pre-tax", "after-tax"], required: true },
    id: { type: String, required: true , unique: false},
    },
    { _id: false }
);

// LifeEvents are also individual to Financial Plans
// ATTRIBUTES PER TYPE
// income    -> initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction, socialSecurity
// expense   -> initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction, discretionary
// invest    -> assetAllocation, glidePath, assetAllocation2, maxCash
// rebalance -> assetAllocation
export interface ILifeEvent extends Document {
    name: string;
    description: string;
    start: IDistribution;
    duration: IDistribution;
    type: "income" | "expense" | "invest" | "rebalance";
    initialAmount?: number;
    changeAmtOrPct?: "amount" | "percent";
    changeDistribution?: IDistribution;
    inflationAdjusted?: boolean;
    userFraction?: number;
    socialSecurity?: boolean;
    discretionary?: boolean;
    assetAllocation?: Record<string, number>;
    glidePath?: boolean;
    assetAllocation2?: Record<string, number>;
    maxCash?: number;
}

const LifeEventSchema = new Schema<ILifeEvent>({
    name: { type: String, required: true, default: "" },
    description: { type: String },
    start: { type: DistributionSchema, required: true },
    duration: { type: DistributionSchema, required: true },
    type: { type: String, required: true, enum: ["income", "expense", "invest", "rebalance"] },
    initialAmount: { type: Number, 
        required: function (this: ILifeEvent) { return this.type === "income" || this.type === "expense";
    }},
    changeAmtOrPct: { type: String, enum: ["amount", "percent"],
        required: function (this: ILifeEvent) { return this.type === "income" || this.type === "expense";
    }},
    changeDistribution: { type: DistributionSchema, 
        required: function (this: ILifeEvent) { return this.type === "income" || this.type === "expense";
    }},
    inflationAdjusted: { type: Boolean, 
        required: function (this: ILifeEvent) { return this.type === "income" || this.type === "expense";
    }},
    userFraction: { type: Number, 
        required: function (this: ILifeEvent) { return this.type === "income" || this.type === "expense";
    }},
    socialSecurity: { type: Boolean, 
        required: function (this: ILifeEvent) { return this.type === "income";
    }},
    discretionary: { type: Boolean, 
        required: function (this: ILifeEvent) { return this.type === "expense";
    }},
    assetAllocation: { type: Map, of: Number,
        required: function (this: ILifeEvent) { return this.type === "invest" || this.type === "rebalance";
    }},
    glidePath: { type: Boolean, 
        required: function (this: ILifeEvent) { return this.type === "invest";
    }},
    assetAllocation2: {
        type: Map,
        of: Number,
        required: function (this: ILifeEvent) {
            return this.type === "invest" && this.glidePath === true;
        }
    },
    maxCash: {
        type: Number,
        required: function (this: ILifeEvent) {
        return this.type === "invest";
        }
    },
    
    },
    { _id: false }
    
);

// Actual Financial Plan

export interface IFinancialPlan extends Document {
    _id: mongoose.Types.ObjectId;
    userId: string;
    name: string;
    maritalStatus: "couple" | "individual"
    birthYears: number[];
    lifeExpectancy: IDistribution[];
    investmentTypes: IInvestmentType[];
    investments: IInvestment[];
    eventSeries: ILifeEvent[];
    inflationAssumption: IDistribution;
    afterTaxContributionLimit: number;
    spendingStrategy: string[];
    expenseWithdrawalStrategy: string[]; // list of investments, identified by id
    RMDStrategy: string[];  // list of pre-tax investments, identified by id
    RothConversionOpt: boolean;
    RothConversionStart: number;
    RothConversionEnd: number;
    RothConversionStrategy: string[]; // ist of pre-tax investments, identified by id
    financialGoal: number;
    residenceState: string;
    // Sharing Controls
    // for now 2 seperate arrays (not sure if can tuple)
    sharedUsersId: string[];
    sharedUserPerms: {
        userId: string;
        perm: "view" | "edit";
      }[];
    version: number;
}

const financialplanSchema = new Schema<IFinancialPlan>({
    userId: { type: String }, // was Schema.Types.ObjectId
    name: { type: String, required: true },
    maritalStatus : { type: String, enum: ["couple", "individual"] },
    birthYears: { type: [Number], required: true, default: [] },
    lifeExpectancy: { type: [DistributionSchema], required: true, default: [] },
    investmentTypes: { type: [investmentTypeSchema], required: true, default: [] },
    investments: { type: [InvestmentSchema], required: true, default: [] },
    eventSeries: { type: [LifeEventSchema], required: true, default: [] },
    inflationAssumption: { type: DistributionSchema, required: true},
    afterTaxContributionLimit: { type: Number, required: true },
    spendingStrategy: { type: [String], required: true, default: [] },
    expenseWithdrawalStrategy: { type: [String], required: true, default: [] },
    RMDStrategy: { type: [String], required: true, default: [] },
    RothConversionOpt: { type: Boolean, required: true, default: false },
    RothConversionStart: { type: Number, required: true, default: -1 },
    RothConversionEnd: { type: Number, required: true, default: 0 },
    RothConversionStrategy: { type: [String], default: [] },
    financialGoal: { type: Number, required: true },
    residenceState: { type: String, required: true },
    sharedUsersId: { type: [String], required: true, default: [] }, 
    sharedUserPerms: {
        type: [{
          userId: { type: String, required: true },
          perm: { type: String, enum: ["view", "edit"], required: true }
        }],
        default: []
      },
    version: { type: Number, required: true, default: 1 },
});

// Index for faster queries by userId
// financialplanSchema.index({ userId: 1 });

const FinancialPlan = mongoose.model<IFinancialPlan>("FinancialPlan", financialplanSchema);

export default FinancialPlan;