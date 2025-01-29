import { useMemo } from "react";

export const useQuoteCalculations = (state) => {
  return useMemo(() => {
    // 1) Calculate base totals:
    const { total, salesTax, sumPackages, sumAccessories, sumTradeIns, sumFees } = calculateTotal(state);

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
  const sumTradeIns = Number(state.tradeInAllowance) - Number(state.tradeInPayoff) || 0;
  const sumFees = sumValues(state.fees);
  const salesTaxRate = parseFloat(state.salesTaxRate) || 0;
  //   console.log("GAP", getGapAmount(state.packages));
  const taxableAmount = sellingPrice - sumTradeIns + (sumPackages - getGapAmount(state.packages)) + sumAccessories;
  const salesTax = (salesTaxRate / 100) * taxableAmount;

  const total = (sellingPrice + sumPackages + sumAccessories + salesTax + sumFees - sumTradeIns).toFixed(2);

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
        if (searchTerms.some((term) => labelNormalized.includes(term)) && pkg.include) {
          return pkg.value; // Return the value if a match is found and 'include' is true
        }
      }
    }

    // Return 0 if no matching label is found or 'include' is not true
    return 0;
  }
};

function recalcPayments(paymentMatrix, totalOTD) {
  const numericTotal = parseFloat(totalOTD) || 0;
  const { terms, downPayments } = paymentMatrix;

  const updatedDP = downPayments.map((dp) => {
    const payments = terms.map((term) => {
      if (!term.selected) return null;

      // Principal = Total OTD - Down Payment
      const principal = numericTotal - dp.amount;

      // Loan duration and APR
      const durationMonths = Number(term.duration) || 0;
      const apr = Number(term.apr) || 0;

      if (durationMonths <= 0) return "Invalid Duration";

      // Step 1: Calculate daily interest rate
      const dailyRate = apr / (100 * 365);

      // Step 2: Convert daily rate to effective monthly rate
      const effectiveMonthlyRate = Math.pow(1 + dailyRate, 30.44) - 1;

      // Step 3: Amortized payment formula
      const numerator = principal * effectiveMonthlyRate;
      const denominator =
        1 - Math.pow(1 + effectiveMonthlyRate, -durationMonths);

      const monthlyPayment = numerator / denominator;

      // Round to 2 decimals
      return parseFloat(monthlyPayment.toFixed(2));
    });

    return { ...dp, payments };
  });

  return { terms, downPayments: updatedDP };
}
