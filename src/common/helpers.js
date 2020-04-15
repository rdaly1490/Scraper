const compactMap = (arr, cb) => {
  return arr.map(cb).filter(x => x);
};

module.exports = {
  compactMap
};
