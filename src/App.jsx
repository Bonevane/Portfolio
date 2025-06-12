import Aurora from "./bits/Aurora";

import Flower from "./components/Home/Flower.jsx";
import Dock from "./components/dock/Dock.jsx";
import Cards from "./components/cards/Cards.jsx";
import "./App.css";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const cards = Array.from({ length: 16 }, (_, i) => ({
//   id: i,
//   title: `Project ${i + 1}`,
// }));

export default function App() {
  return (
    <div>
      <Aurora
        colorStops={["#FFA73C", "#FFA73C", "#FF3232"]}
        blend={1}
        amplitude={0.5}
        speed={1}
      />
      <Dock />
      <Cards />
      {/* <Flower /> */}
    </div>

    // const [selected, setSelected] = useState(null);
    // const [centerIndex, setCenterIndex] = useState(4);

    // const visibleCards = cards.slice(centerIndex - 4, centerIndex + 4);

    // const rotateCard = (index) => {
    //   const offset = index - 3.5;
    //   return `rotate(${offset * 10}deg)`;
    // };

    // const scroll = (direction) => {
    //   setCenterIndex((prev) => {
    //     const next = prev + direction;
    //     if (next < 4 || next > cards.length - 4) return prev;
    //     return next;
    //   });
    // };

    // const handleWheel = (e) => {
    //   if (e.deltaY > 0) scroll(0.2);
    //   else scroll(-0.2);
    // };

    // <div
    //   className="w-screen h-screen bg-gray-900 flex items-center justify-center overflow-hidden"
    //   onWheel={handleWheel}
    // >

    //   <div className="relative w-[600px] h-[400px]">
    //     {visibleCards.map((card, i) => (
    //       <motion.div
    //         key={card.id}
    //         onClick={() => setSelected(card)}
    //         className="absolute w-40 h-60 rounded-xl shadow-xl cursor-pointer overflow-hidden border-1 border-white backdrop-blur-sm  "
    //         style={{
    //           top: "50%",
    //           left: "50%",
    //           transform: "translate(-50%, -50%)",
    //           zIndex: i,
    //         }}
    //         animate={{
    //           x: Math.cos(((i - 3.5) / 8) * Math.PI) * 200,
    //           y: Math.sin(((i - 3.5) / 8) * Math.PI) * 60,
    //           rotate: (i - 3.5) * 10,
    //           scale: i === 3 ? 1.1 : 0.9,
    //           opacity: i === 7 ? 1.1 : 0.7,
    //         }}
    //         transition={{ type: "spring", stiffness: 200, damping: 30 }}
    //       >
    //         <div className="w-full h-full flex items-center justify-center font-bold text-center text-white backdrop-blur-sm bg-black/30">
    //           {card.title}
    //         </div>
    //       </motion.div>
    //     ))}

    //     <AnimatePresence>
    //       {selected && (
    //         <motion.div
    //           className="absolute w-[300px] h-[420px] rounded-xl shadow-2xl flex items-center justify-center text-xl font-bold text-white z-50 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 border-4 border-white"
    //           initial={{ opacity: 0, scale: 0.5 }}
    //           animate={{ opacity: 1, scale: 1 }}
    //           exit={{ opacity: 0, scale: 0.5 }}
    //           style={{
    //             top: "50%",
    //             left: "50%",
    //             transform: "translate(-50%, -50%)",
    //           }}
    //           onClick={() => setSelected(null)}
    //         >
    //           {selected.title}
    //         </motion.div>
    //       )}
    //     </AnimatePresence>
    //   </div>
    // </div>
  );
}
