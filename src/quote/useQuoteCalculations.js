import { useMemo } from "react";
import Decimal from "decimal.js";

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
    const paymentMatrix = recalcPayments(state.paymentMatrix, total, state.daysToFirstPayment);
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

function recalcPayments(paymentMatrix, totalOTD, daysToFirstPayment) {
  const numericTotal = parseFloat(totalOTD) || 0;
  const { terms, downPayments } = paymentMatrix;

  const updatedDP = downPayments.map((dp) => {
    const payments = terms.map((term) => {
      if (!term.selected) return null;

      // Calculate principal as Total OTD minus the down payment.
      const principal = numericTotal - dp.amount;
      const durationMonths = Number(term.duration) || 0;
      const apr = Number(term.apr) || 0;

      try {
        return calculateMonthlyPayment(principal, durationMonths, apr, daysToFirstPayment);
      } catch (error) {
        return error.message;
      }
    });

    return { ...dp, payments };
  });

  return { terms, downPayments: updatedDP };
}

Decimal.set({ precision: 50, rounding: Decimal.ROUND_HALF_UP });

export function calculateMonthlyPayment(principal, durationMonths, apr, daysToFirstPayment = 45) {
  // Convert inputs to Decimal instances.
  const principalDec = new Decimal(principal);
  const durationDec = new Decimal(durationMonths);
  const aprDec = new Decimal(apr);
  const daysToFirstPaymentDec = new Decimal(daysToFirstPayment);

  if (durationDec.lte(0)) {
    throw new Error("Invalid duration");
  }

  // Use a fixed day count basis of 360 days.
  const dayCountBasis = new Decimal(360);
  const dailyRate = aprDec.dividedBy(100).dividedBy(dayCountBasis);

  // If the first payment is more than 30 days away, accrue extra interest for the extra days.
  let effectivePrincipal = principalDec;
  if (daysToFirstPaymentDec.gt(30)) {
    const extraDays = daysToFirstPaymentDec.minus(30);
    effectivePrincipal = principalDec.plus(principalDec.times(dailyRate).times(extraDays));
  }

  let monthlyPayment;
  if (aprDec.equals(0)) {
    monthlyPayment = effectivePrincipal.dividedBy(durationDec);
  } else {
    // Nominal monthly rate calculation.
    const monthlyRate = aprDec.dividedBy(100).dividedBy(12);
    const factor = Decimal.pow(new Decimal(1).plus(monthlyRate), durationDec);
    monthlyPayment = effectivePrincipal.times(monthlyRate).times(factor).dividedBy(factor.minus(1));
  }

  // Return the result rounded to two decimals using standard half‑up rounding.
  return Number(monthlyPayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString());
}

calculateMonthlyPayment.version = "1.0.14";

export function firstPaymentDate(daysUntilPayment = 45, startDate = new Date()) {
  const newDate = new Date(startDate); // clone the date
  const delay = Number(daysUntilPayment); // ensure it's a number
  newDate.setDate(newDate.getDate() + delay);
  return newDate;
}

