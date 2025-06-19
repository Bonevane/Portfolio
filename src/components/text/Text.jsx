import SplitText from "../../bits/SplitText";
import { sectionMap } from "../../data/sections";
import ToggleSwitch from "./Toggle";
import "./Text.css";

export default function TextOverlay({ tab, cardSection, setMiscSection }) {
  let title = "";
  let subtitles = [""];

  const activeSectionKey = tab === "Portfolios" ? cardSection : tab;

  if (Object.prototype.hasOwnProperty.call(sectionMap, activeSectionKey)) {
    title = sectionMap[activeSectionKey].title;
    subtitles = sectionMap[activeSectionKey].subtitle;
  } else {
    title = sectionMap["404"].title;
    subtitles = sectionMap["404"].subtitle;
  }

  return (
    <div
      className={`text-container fixed gap-8 flex flex-col z-10 text-left opacity-0 animate-[fadeIn_1s_ease-in_forwards] ${
        tab === "Home" ? "in-home" : ""
      } ${tab === "Misc" ? "in-misc" : ""} ${
        tab === "Contact" ? "in-contact" : ""
      }`}
    >
      <div key={title} style={{ pointerEvents: "all" }}>
        <div>
          <SplitText
            text={title}
            className="text-[4.6em] text-[#CEC9C9] mb-2 font-[ElMessiri]"
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
      {tab === "Misc" && (
        <div
          className="text-[#CEC9C9] text-[1.2em] font-[Teachers] mt-4"
          style={{ pointerEvents: "all" }}
        >
          <ToggleSwitch setMiscSection={setMiscSection} />
        </div>
      )}
    </div>
  );
}
