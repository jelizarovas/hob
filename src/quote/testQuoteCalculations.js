// testQuoteCalculations.js
// node src/quote/testQuoteCalculations.js
import { calculateMonthlyPayment } from "./useQuoteCalculations.js";

const testCases = [
  { principal: 38800, durationMonths: 36, apr: 2.49, expected: 1120.81 },
  { principal: 38800, durationMonths: 60, apr: 3.49, expected: 706.69 },
  { principal: 38800, durationMonths: 72, apr: 4.49, expected: 616.89 },
  { principal: 28800, durationMonths: 36, apr: 2.49, expected: 831.94 },
];

testCases.forEach(({ principal, durationMonths, apr, expected }) => {
  const result = calculateMonthlyPayment(principal, durationMonths, apr);
  console.log(
    `Test case (v${calculateMonthlyPayment.version}): Principal: ${principal}, Duration: ${durationMonths}mo, APR: ${apr}%`
  );
  console.log(`Calculated Payment: $${result} (Expected: $${expected})`);
  console.log(result === expected ? "✅ Test passed." : `❌ Test failed: expected ${expected}, but got ${result}`);
  console.log("---");
});
