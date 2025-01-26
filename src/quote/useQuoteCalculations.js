import { useMemo } from "react";

export const useQuoteCalculations = (state) => {
  return useMemo(() => {
    // 1) Calculate base totals:
    const {
      total,
      salesTax,
      sumPackages,
      sumAccessories,
      sumTradeIns,
      sumFees,
    } = calculateTotal(state);

    console.log({
      total,
      salesTax,
      sumPackages,
      sumAccessories,
      sumTradeIns,
      sumFees,
    });
    // 2) Calculate payment matrix from “total”:
    const paymentMatrix = recalcPayments(state.paymentMatrix, total);
    return {
      total,
      salesTax,
      sumPackages,
      sumAccessories,
      sumTradeIns,
      sumFees,
      paymentMatrix,
    };
  }, [state]);
};

const calculateTotal = (state) => {
  const sumValues = (items) => {
    if (!items || typeof items !== "object") {
      return 0;
    }

    return Object.values(items).reduce((sum, item) => {
      if (item.include) {
        const itemValue = parseFloat(item.value) || 0;
        return sum + itemValue;
      }
      return sum;
    }, 0);
  };

  const sellingPrice = parseFloat(state.sellingPrice) || 0;
  const sumPackages = sumValues(state.packages);
  const sumAccessories = sumValues(state.accessories);
  const sumTradeIns =
    Number(state.tradeInAllowance) - Number(state.tradeInPayoff) || 0;
  const sumFees = sumValues(state.fees);
  const salesTaxRate = parseFloat(state.salesTaxRate) || 0;
  //   console.log("GAP", getGapAmount(state.packages));
  const taxableAmount =
    sellingPrice -
    sumTradeIns +
    (sumPackages - getGapAmount(state.packages)) +
    sumAccessories;
  const salesTax = (salesTaxRate / 100) * taxableAmount;

  const total = (
    sellingPrice +
    sumPackages +
    sumAccessories +
    salesTax +
    sumFees -
    sumTradeIns
  ).toFixed(2);

  return {
    total,
    salesTax,
    sumPackages,
    sumAccessories,
    sumTradeIns,
    sumFees,
  };

  function getGapAmount(packages) {
    // Normalize the search terms for comparison
    const searchTerms = ["gap", "nas gap"];

    // Iterate over the packages object
    for (const key in packages) {
      if (packages.hasOwnProperty(key)) {
        const pkg = packages[key]; // Use 'pkg' to avoid reserved word conflict
        // Normalize the label for comparison and check the 'include' property
        const labelNormalized = pkg?.label?.toLowerCase() || "";
        if (
          searchTerms.some((term) => labelNormalized.includes(term)) &&
          pkg.include
        ) {
          return pkg.value; // Return the value if a match is found and 'include' is true
        }
      }
    }

    // Return 0 if no matching label is found or 'include' is not true
    return 0;
  }
};

function recalcPayments(paymentMatrix, totalOTD) {
  console.log({ paymentMatrix, totalOTD });
  const numericTotal = parseFloat(totalOTD) || 0;
  const { terms, downPayments } = paymentMatrix; // Guaranteed arrays if initialQuote is shaped properly

  const updatedDP = downPayments.map((dp) => {
    // For each selected term, compute monthly payment
    const payments = terms.map((term) => {
      if (!term.selected) return null;
      const principal = numericTotal - dp.amount;
      const duration = Number(term.duration) || 0;
      const apr = Number(term.apr) || 0;
      if (duration <= 0) return "Invalid Duration";
      const monthlyRate = apr / 100 / 12;
      return monthlyRate === 0
        ? (principal / duration).toFixed(2)
        : (
            (principal * monthlyRate) /
            (1 - Math.pow(1 + monthlyRate, -duration))
          ).toFixed(2);
    });
    return { ...dp, payments };
  });

  return { terms, downPayments: updatedDP };
}
