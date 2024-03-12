module.exports = (iterable) => {
  let sum = 0;
  for (const value of iterable) {
    sum += value;
  }
  return sum;
};