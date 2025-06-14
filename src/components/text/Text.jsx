import SplitText from "../../bits/SplitText";
import { sectionMap } from "../../data/sections";

export default function TextOverlay({ tab, cardSection }) {
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

  //   if (tab === "Home") {
  //     title = "Rafay Ahmad.";
  //     subtitle =
  //       "Welcome to my space. This is where I share my work and thoughts.";
  //   } else if (tab === "Portfolios") {
  //     if (cardSection < 0.2) {
  //       title = "Work";
  //       subtitle = "My portfolio. check it out yo.";
  //     } else if (cardSection < 0.6) {
  //       title = "Projects";
  //       subtitle = "Some cool stuff I made.";
  //     } else {
  //       title = "Experiments";
  //       subtitle = "Just playing around.";
  //     }
  //   } else {
  //     title = "Hello.";
  //     subtitle = "You're on an unknown tab.";
  //   }

  return (
    <div className="fixed top-0 left-0 p-[6rem] flex flex-col z-50 text-left opacity-0 animate-[fadeIn_1s_ease-in_forwards]">
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
        {/* <p
        key={subtitle}
        className="text-[#CEC9C9] text-[1.6rem] font-[Teachers] opacity-0 animate-[fadeIn_1s_ease-in_forwards]"
      >
        {subtitle}
      </p> */}
      </div>
    </div>
  );
}
