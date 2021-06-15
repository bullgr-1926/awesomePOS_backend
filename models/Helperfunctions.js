// Return the current date in LocaleDateString
exports.createLocaleDateString = () => {
  const newDate = new Date();
  const newLocaleDateString = newDate.toLocaleDateString();
  return newLocaleDateString;
};

// Return the current date in LocaleString
exports.createLocaleString = () => {
  const newDate = new Date();
  const newLocaleString = newDate.toLocaleString();
  return newLocaleString;
};
