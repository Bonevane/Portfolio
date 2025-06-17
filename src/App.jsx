import Aurora from "./bits/Aurora";
import { useState } from "react";

import Flower from "./components/Home/Flower.jsx";
import Dock from "./components/dock/Dock.jsx";
import Cards from "./components/cards/Cards.jsx";
import TextOverlay from "./components/text/Text.jsx";
import Gallery from "./components/gallery/Gallery.jsx";
import "./App.css";
import Phone from "./components/phone/Phone.jsx";
import Orbit from "./components/orbit/Orbit.jsx";
import { picsLeft, picsRight } from "./data/Pictures.js";
import { colors } from "./data/Colors.js";

export default function App() {
  const [currentTab, setCurrentTab] = useState("Home");
  const [cardSection, setCardSection] = useState(0);
  const [miscSection, setMiscSection] = useState("");
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
      <TextOverlay
        tab={currentTab}
        cardSection={cardSection}
        setMiscSection={setMiscSection}
      />
      <Dock selected={currentTab} setSelected={setCurrentTab} />
      {/* Show content based on active tab */}
      {currentTab === "Portfolios" && <Cards setCardSection={setCardSection} />}
      {currentTab === "Home" && <Flower />}
      {currentTab === "Misc" &&
        (miscSection === "Misc" ? (
          <Gallery imagesLeft={picsLeft} imagesRight={picsRight} />
        ) : (
          <Phone />
        ))}
      {currentTab === "Contact" && <Orbit />}
    </div>
  );
}
