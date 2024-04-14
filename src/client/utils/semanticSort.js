export const fileNameSort = (fn) => (a, b) => {
  return fn(a.name, b.name);
}

export const semanticSort = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return 0;
  }
  const aParts = a.split(/,| |\_|\./);
  const bParts = b.split(/,| |\_|\./);
  const maxParts = Math.max(aParts.length, bParts.length)

  for (let index = 0; index < maxParts; index++) {
    if (index > aParts.length) {
      return 1;
    }
    if (index > bParts.length) {
      return -1;
    }
    if (aParts[index] !== bParts[index]) {
      return aParts[index] - bParts[index];
    }
  }
  return 0;
}

export const alphabeticSort = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return 0;
  }
  return a.localeCompare(b);
}