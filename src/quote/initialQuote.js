import cuid from "cuid";

export const initialQuote = {
  listedPrice: 32040,
  discount: 500,
  sellingPrice: 31540,
  packages: {
    [cuid.slug()]: {
      label: "Vehicle Service Contract",
      value: 4495,
      include: true,
    },
    [cuid.slug()]: {
      label: "LoJack",
      value: 795,
      include: true,
    },
    [cuid.slug()]: {
      label: "PermaPlate",
      value: 995,
      include: true,
    },
    [cuid.slug()]: {
      label: "GAP",
      value: 995,
      include: true,
    },
    [cuid.slug()]: {
      label: "Rairdon Investment Package",
      value: 1995,
      include: true,
    },
    [cuid.slug()]: {
      label: "Dealer Prep",
      value: 695,
      include: true,
    },
  },
  accessories: {
    [cuid.slug()]: {
      label: "All Weather Mats",
      value: 270,
      include: false,
    },
  },
  tradeIns: {},
  salesTaxRate: 10.5,
  fees: {
    docfee: {
      label: "Doc Fee",
      value: 200,
      include: true,
    },
    other: {
      label: "Estimated Licensing Fees",
      value: 899,
      include: true,
    },
  },
  paymentMatrix: {
    totalOTD: 0,
    downPaymentOptions: ["$0.00", "$2000.00", "$4000.00"],
    termHeaders: [
      { payments: 48, type: "monthly", apr: 9.9 },
      { payments: 60, type: "monthly", apr: 9.9 },
      { payments: 72, type: "monthly", apr: 9.9 },
    ],
    calculatedPayments: [],
  },
  totals: {
    total: 0,
    salesTax: 0,
    sumPackages: 0,
    sumAccessories: 0,
    sumTradeIns: 0,
    sumFees: 0,
  },
};
