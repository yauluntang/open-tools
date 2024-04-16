
export const fileNameSort = (array, fn) => {
  array.sort((a, b) => fn(a.name, b.name));
}

export const shuffleArray = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
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