
export const getSoftScore = d => d.reduce((s, c) => s + Math.max(c, 0), 0);

export const hasAce = d => d.some((c) => c === 1);

export const getMaxScore = cards => {
  const minScore = getSoftScore(cards);
  return (minScore <= 11 && hasAce(cards)) ? minScore + 10 : minScore;
}

export const calculateMaxScore = h => getMaxScore(getCards(h))

export const calculateSoftScore = h => getSoftScore(getCards(h))

export const getRank = c => ((c - 1) % 13) + 1;

export const getScore = c => getRank(c) >= 11 ? 10 : getRank(c);

export const getCards = h => h.map(c => getScore(c))

export const isSplittable = h => h.length === 2 && getRank(h[0]) === getRank(h[1]);