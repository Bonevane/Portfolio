import { useState, useEffect } from "react";

import Aurora from "./bits/Aurora";
import Cursor from "./components/cursor/Cursor.jsx";
import Flower from "./components/home/Flower.jsx";
import Dock from "./components/dock/Dock.jsx";
import Cards from "./components/cards/Cards.jsx";
import VideoPlayer from "./components/player/VideoPlayer.jsx";
import TextOverlay from "./components/text/Text.jsx";
import Gallery from "./components/gallery/Gallery.jsx";
import Phone from "./components/phone/Phone.jsx";
import Orbit from "./components/orbit/Orbit.jsx";
import Experience from "./components/experience/Experience.jsx";
import { picsLeft, picsRight } from "./data/Pictures.js";
import { colors } from "./data/Colors.js";
import { paths, tabsFromPath } from "./data/Paths.js";
import "./App.css";

export default function App() {
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : "/";
  const initialTab = tabsFromPath[initialPath] || "404";
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [cardSection, setCardSection] = useState(0);
  const [miscSection, setMiscSection] = useState("Photos");
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeExperience, setActiveExperience] = useState(false);
  let color = ["", "", ""];

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

    const isMacSafari =
      /Macintosh/.test(ua) &&
      /Safari/.test(ua) &&
      !/Chrome|Chromium|Edg/.test(ua);

    if (isIOS) document.body.classList.add("ios");
    if (isMacSafari) document.body.classList.add("mac");
  }, []);

  // Navigation and History API
  useEffect(() => {
    const newPath = paths[currentTab];
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab: currentTab }, "", newPath);
    }
    
    // Dynamic SEO Titles
    if (currentTab) {
      document.title = `${currentTab === "Home" ? "Creative Developer & Designer" : currentTab} | Rafay Ahmad`;
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
    <div className=" w-screen h-screen overflow-hidden relative">
      <Cursor />
      
      {/* Background stays completely static */}
      <div className="absolute inset-0 w-full h-full">
      <Aurora colorStops={color} blend={1} amplitude={0.5} speed={1} />
      </div>
      
      {/* Only the UI contents lift up and out */}
      <main
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] origin-bottom ${
          (activeVideo || activeExperience)
            ? "translate-y-[-100vh] scale-90 opacity-0 pointer-events-none" 
            : "translate-y-0 scale-100 opacity-100"
        } ${currentTab === "Portfolios" ? "cards-page" : ""}`}
      >
        <div>
          <TextOverlay
            tab={currentTab}
            activeSectionKey={activeSectionKey}
            setMiscSection={setMiscSection}
            setActiveVideo={setActiveVideo}
            setActiveExperience={setActiveExperience}
          />

        {/* Show content based on active tab */}
        {currentTab === "Home" && <Flower />}
        {currentTab === "Portfolios" && (
          <Cards setCardSection={setCardSection} setActiveVideo={setActiveVideo} />
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
      </main>
      
      {activeVideo && (
        <VideoPlayer 
          media={activeVideo.media}
          initialIndex={activeVideo.startIndex}
          onClose={() => setActiveVideo(null)} 
        />
      )}

      {activeExperience && (
        <Experience onClose={() => setActiveExperience(false)} />
      )}
    </div>
  );
}
