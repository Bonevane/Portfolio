import { useState, useEffect } from "react";

import Aurora from "./bits/Aurora";
import Flower from "./components/home/Flower.jsx";
import Dock from "./components/dock/Dock.jsx";
import Cards from "./components/cards/Cards.jsx";
import TextOverlay from "./components/text/Text.jsx";
import Gallery from "./components/gallery/Gallery.jsx";
import Phone from "./components/phone/Phone.jsx";
import Orbit from "./components/orbit/Orbit.jsx";
import { picsLeft, picsRight } from "./data/Pictures.js";
import { colors } from "./data/Colors.js";
import { paths, tabsFromPath } from "./data/Paths.js";
import "./App.css";

export default function App() {
  const [currentTab, setCurrentTab] = useState("");
  const [cardSection, setCardSection] = useState(0);
  const [miscSection, setMiscSection] = useState("Photos");
  let color = ["", "", ""];

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      document.body.classList.add("ios");
    }
  }, []);

  // Navigation and History API
  useEffect(() => {
    const newPath = paths[currentTab];
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab: currentTab }, "", newPath);
    }
  }, [currentTab]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const tab = tabsFromPath[path] || "404";
      setCurrentTab(tab);
    };

    window.addEventListener("popstate", handlePopState);
    handlePopState();

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Active Section calculation (For colors and text)
  let activeSectionKey = currentTab === "Portfolios" ? cardSection : currentTab;
  activeSectionKey = currentTab === "Misc" ? miscSection : activeSectionKey;
  if (Object.prototype.hasOwnProperty.call(colors, activeSectionKey)) {
    color = colors[activeSectionKey];
  } else {
    color = ["#000", "#000", "#000"];
  }

  return (
    <div>
      <Aurora colorStops={color} blend={1} amplitude={0.5} speed={1} />
      <div>
        <TextOverlay
          tab={currentTab}
          activeSectionKey={activeSectionKey}
          setMiscSection={setMiscSection}
        />

        {/* Show content based on active tab */}
        {currentTab === "Home" && <Flower />}
        {currentTab === "Portfolios" && (
          <Cards setCardSection={setCardSection} />
        )}
        {currentTab === "Misc" &&
          (miscSection === "Gallery" ? (
            <Gallery imagesLeft={picsLeft} imagesRight={picsRight} />
          ) : (
            <Phone />
          ))}
        {currentTab === "Contact" && <Orbit />}
        <div className="dock-background">
          <Dock selected={currentTab} setSelected={setCurrentTab} />
        </div>
      </div>
    </div>
  );
}
