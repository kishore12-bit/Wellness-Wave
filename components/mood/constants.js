import happyAnimation from "../../assets/animation/happy.json";
import sadAnimation from "../../assets/animation/sad.json";
import goodAnimation from "../../assets/animation/good.json";
import neutralAnimation from "../../assets/animation/neutral.json";
import unhappyAnimation from "../../assets/animation/unhappy.json";

export const moods = [
  { id: 1, label: "Unhappy", color: "#FF6B6B" },
  { id: 2, label: "Sad", color: "#74B9FF" },
  { id: 3, label: "Normal", color: "#95A5A6" },
  { id: 4, label: "Good", color: "#55EFC4" },
  { id: 5, label: "Happy", color: "#FFD93D" },
];

export const getMoodAnimation = (moodId) => {
  switch (moodId) {
    case 1:
      return unhappyAnimation;
    case 2:
      return sadAnimation;
    case 3:
      return neutralAnimation;
    case 4:
      return goodAnimation;
    case 5:
      return happyAnimation;
    default:
      return neutralAnimation;
  }
};
