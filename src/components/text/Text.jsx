import SplitText from "../../bits/SplitText";
import { sectionMap } from "../../data/sections";
import ToggleSwitch from "./Toggle";

export default function TextOverlay({ tab, cardSection, setMiscSection }) {
  let title = "";
  let subtitle = "";

  const activeSectionKey = tab === "Portfolios" ? cardSection : tab;

  if (Object.prototype.hasOwnProperty.call(sectionMap, activeSectionKey)) {
    title = sectionMap[activeSectionKey].title;
    subtitle = sectionMap[activeSectionKey].subtitle;
  } else {
    title = "Hello.";
    subtitle = "You're on an unknown tab.";
  }

  return (
    <div className="fixed top-0 left-0 p-[6rem] gap-8 flex flex-col z-50 text-left opacity-0 animate-[fadeIn_1s_ease-in_forwards]">
      <div key={title}>
        <div>
          <SplitText
            text={title}
            className="text-[5rem] text-[#CEC9C9] mb-2 font-[ElMessiri]"
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
        <div>
          <SplitText
            text={subtitle}
            className="text-[#CEC9C9] text-[1.6rem] font-[Teachers]"
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
        </div>
      </div>
      {tab === "Misc" && (
        <div className="text-[#CEC9C9] text-[1.2rem] font-[Teachers] mt-4">
          <ToggleSwitch setMiscSection={setMiscSection} />
        </div>
      )}
    </div>
  );
}
