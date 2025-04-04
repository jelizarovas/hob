import cuid from "cuid";

export const initialQuote = {
  listedPrice: 0,
  discount: 0,
  sellingPrice: 0,
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
    terms: [
      { id: 1, duration: 48, apr: 9.9, selected: true },
      { id: 2, duration: 60, apr: 9.9, selected: true },
      { id: 3, duration: 72, apr: 9.9, selected: true },
    ],
    downPayments: [
      { id: 1, amount: 0, selected: true },
      { id: 2, amount: 2000, selected: true },
      { id: 3, amount: 4000, selected: true },
    ],
  },
  daysToFirstPayment: 45,
  dealData: {
    dealership: {
      storeId: "123",
      shortName: "HofB",
      longName: "Honda Burien",
      legalName: "HOFB Inc. dba Honda of Burien",
      address: "15206 1st Ave S. Burien, King, WA 98148",
      addressLine1: "15206 1st Ave S.",
      addressLine2: "Burien, King, WA 98148",
    },
  },
};
