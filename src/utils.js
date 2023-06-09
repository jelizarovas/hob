export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function camelCaseToProperCase(str) {
  // Replace capital letters with space and the letter itself
  const spacedStr = str.replace(/([A-Z])/g, " $1");
  // Capitalize the first letter and maintain the case of the subsequent letters
  const properCaseStr = spacedStr.charAt(0).toUpperCase() + spacedStr.slice(1);
  return properCaseStr;
}
