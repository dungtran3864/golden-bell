export function convertStringToBoolean(value) {
  const lowerCaseValue = value.toLowerCase().trim();
  switch (lowerCaseValue) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return false;
  }
}
