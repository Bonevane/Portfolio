import Aurora from "./bits/Aurora";
import React, { useState } from "react";

import Flower from "./components/Home/Flower.jsx";
import Dock from "./components/dock/Dock.jsx";
import Cards from "./components/cards/Cards.jsx";
import TextOverlay from "./components/text/Text.jsx";
import "./App.css";

const sections = {
  Home: ["#FFA73C", "#FFA73C", "#FF3232"],
  Portfolios: ["#5227FF", "#7cff67", "#5227FF"],
  About: ["#00B4DB", "#0083B0", "#005f73"],
  Contact: ["#ff5f6d", "#ffc371", "#ff5f6d"],
  // Add more as needed
};

export default function App() {
  const [currentTab, setCurrentTab] = useState("Home");
  const [cardSection, setCardSection] = useState(0);

  return (
    <div>
      <Aurora
        colorStops={sections[currentTab] ?? ["#000", "#000", "#000"]}
        blend={1}
        amplitude={0.5}
        speed={1}
      />
      <TextOverlay tab={currentTab} cardSection={cardSection} />
      <Dock selected={currentTab} setSelected={setCurrentTab} />
      {/* Show content based on active tab */}
      {currentTab === "Portfolios" && <Cards setCardSection={setCardSection} />}
      {currentTab === "Home" && <Flower />}
    </div>
  );
}
