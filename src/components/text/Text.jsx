import SplitText from "../../bits/SplitText";
import { sectionMap } from "../../data/Sections.js";
import { cinematicMedia } from "../../data/Videos.js";
import ToggleSwitch from "./Toggle";
import "./Text.css";

export default function TextOverlay({ tab, activeSectionKey, setMiscSection, setActiveVideo, setActiveExperience }) {
  let title = "";
  let subtitles = [""];

  if (Object.prototype.hasOwnProperty.call(sectionMap, activeSectionKey)) {
    title = sectionMap[activeSectionKey].title;
    subtitles = sectionMap[activeSectionKey].subtitle;
  } else {
    title = sectionMap["404"].title;
    subtitles = sectionMap["404"].subtitle;
  }

  return (
    <div
      className={`text-container fixed gap-8 flex flex-col z-50 text-left opacity-0 animate-[fadeIn_1s_ease-in_forwards] ${
        tab === "Home" ? "in-home" : ""
      } ${tab === "Misc" ? "in-misc" : ""} ${
        tab === "Contact" ? "in-contact" : ""
      }`}
    >
      <div key={title} style={{ pointerEvents: "all" }}>
        <div>
          <SplitText
            as="h1"
            text={title}
            className="text-[4.6em] text-[#CEC9C9] mb-2 font-[ElMessiri] translate-x-[-2%]"
            delay={20}
            duration={2}
            ease="elastic.out(1, 0.3)"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="left"
          />
        </div>
        <div className="flex flex-col gap-4">
          {subtitles.map((subtitle) => (
            <SplitText
              key={subtitle}
              text={subtitle}
              className="text-[#CEC9C9] text-[1.4em] font-[Teachers]"
              delay={10}
              duration={2}
              ease="elastic.out(1, 0.5)"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="left"
            />
          ))}
        </div>
      </div>

      {tab === "Portfolios" && (
        <div
          className="text-[#CEC9C9] text-[1.2em] font-[Teachers] mt-2 flex items-center gap-4"
          style={{ pointerEvents: "all" }}
        >
          <button 
            className="toggle flex items-center gap-3 rounded-full border border-[#757575]/70 px-[2em] py-[0.8em] bg-[#D9D9D9]/15 text-[#CEC9C9] hover:bg-white/20 transition-all carousel-nav-btn font-inherit text-[1em]"
            onClick={() => {
              if (setActiveExperience) setActiveExperience(true);
            }}
          >
            Experience & Publications
          </button>
        </div>
      )}

      {tab === "Misc" && (
        <div
          className="text-[#CEC9C9] text-[1.2em] font-[Teachers] mt-2 flex items-center gap-4"
          style={{ pointerEvents: "all" }}
        >
          <ToggleSwitch setMiscSection={setMiscSection} />
          <button 
            className="toggle flex items-center justify-center aspect-square rounded-full border border-[#757575]/70 p-[0.6em] bg-[#D9D9D9]/15 text-[#CEC9C9] hover:bg-white/20 transition-all carousel-nav-btn"
            onClick={() => {
              if (cinematicMedia.length > 0 && setActiveVideo) {
                setActiveVideo({ media: cinematicMedia, startIndex: 0 });
              }
            }}
            title="Cinematography & Directed Media"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
