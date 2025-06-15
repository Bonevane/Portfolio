import Aurora from "./bits/Aurora";
import React, { useState } from "react";

import Flower from "./components/Home/Flower.jsx";
import Dock from "./components/dock/Dock.jsx";
import Cards from "./components/cards/Cards.jsx";
import TextOverlay from "./components/text/Text.jsx";
import Gallery from "./components/gallery/Gallery.jsx";
import "./App.css";
import Orbit from "./components/orbit/Orbit.jsx";

const itemsLeft = [
  "https://picsum.photos/id/1015/300/400",
  "https://picsum.photos/id/1025/300/400",
  "https://picsum.photos/id/1035/300/400",
  "https://picsum.photos/id/1045/300/400",
  "https://picsum.photos/id/1055/300/400",
];

const itemsRight = [
  "https://picsum.photos/id/1065/300/400",
  "https://picsum.photos/id/1075/300/400",
  "https://picsum.photos/id/1035/300/400",
  "https://picsum.photos/id/1045/300/400",
  "https://picsum.photos/id/1055/300/400",
];

const colors = {
  Home: ["#FFA73C", "#FFA73C", "#FF3232"], // Orange

  Work: ["#00E6E6", "#0073CB", "#001F3F"], // Blue
  Projects: ["#00B4DB", "#00C2CB", "#005f73"], // Cyan
  Experiments: ["#00B4DB", "#7449FF", "#005f73"], // Purple
  Misc1: ["#FFF9C4", "#FFC01F", "#FBC02D"], // Yellow
  Misc: ["#222222", "#222222", "#222222"], // Dark Gray

  Contact: ["#A2DED0", "#16A085", "#004D40"], // Teal
  Miscellaneous: ["#FFADC0", "#FF3C73", "#A00048"], // Pink

  // Additional (Unused)
  Portfolios5: ["#00E6E6", "#FF383B", "#001F3F"], // Red
  Contact5: ["#5227FF", "#7cff67", "#5227FF"], // Green
  Contact4: ["#ff5f6d", "#ffc371", "#ff5f6d"], // Light Orange
  Misc2: ["#FF8A88", "#FFFA80", "#FF8A80"], // Light Yellow
};

export default function App() {
  const [currentTab, setCurrentTab] = useState("Home");
  const [cardSection, setCardSection] = useState(0);
  let color = ["", "", ""];

  const activeSectionKey =
    currentTab === "Portfolios" ? cardSection : currentTab;

  if (Object.prototype.hasOwnProperty.call(colors, activeSectionKey)) {
    color = colors[activeSectionKey];
  } else {
    color = ["#000", "#000", "#000"];
  }

  return (
    <div>
      <Aurora colorStops={color} blend={1} amplitude={0.5} speed={1} />
      <TextOverlay tab={currentTab} cardSection={cardSection} />
      <Dock selected={currentTab} setSelected={setCurrentTab} />
      {/* Show content based on active tab */}
      {currentTab === "Portfolios" && <Cards setCardSection={setCardSection} />}
      {currentTab === "Home" && <Flower />}
      {currentTab === "Misc" && (
        <Gallery imagesLeft={itemsLeft} imagesRight={itemsRight} />
      )}
      {currentTab === "Contact" && <Orbit />}
    </div>
  );
}
