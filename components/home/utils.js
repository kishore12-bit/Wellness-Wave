export const getMoodColor = (mood) => {
  switch (mood.toLowerCase()) {
    case "unhappy":
      return "#FF6B6B"; // Bright red for unhappy
    case "sad":
      return "#74B9FF"; // Light blue for sad
    case "normal":
      return "#95A5A6"; // Gray for normal
    case "good":
      return "#55EFC4"; // Teal for good
    case "happy":
      return "#FFD93D"; // Bright yellow for happy
    default:
      return "rgba(173, 216, 230, 0.5)"; // Default light blue
  }
};

export const getGreetingTime = () => {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 12) return "Good morning";
  if (hours < 18) return "Good afternoon";
  if (hours < 22) return "Good evening";
  return "Good night";
};

export const getMoodEmoji = (mood) => {
  switch (mood.toLowerCase()) {
    case "unhappy":
      return "😢"; // value 1
    case "sad":
      return "😔"; // value 2
    case "normal":
      return "😐"; // value 3
    case "good":
      return "🙂"; // value 4
    case "happy":
      return "😄"; // value 5
    default:
      return "😐";
  }
};
