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

export function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function checkAnswer(yourAnswer, correctAnswer) {
  if (yourAnswer === null && correctAnswer === null) {
    return true;
  }
  if (yourAnswer === null && correctAnswer !== null) {
    return false;
  }
  if (yourAnswer !== null && correctAnswer === null) {
    return false;
  }
  return yourAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

export async function getData(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
