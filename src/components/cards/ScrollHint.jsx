import "./ScrollHint.css";

export default function ScrollHint({ visible, shake, onDismiss }) {
  return (
    <div
      className={`scroll-hint-wrapper fixed top-6 left-1/2 -translate-x-1/2 z-[80] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-14 opacity-0"
      }`}
    >
      <button
        type="button"
        className={`scroll-hint toggle flex items-center rounded-full border border-[#757575]/70 px-[2em] py-[0.8em] bg-[#D9D9D9]/15 text-[#CEC9C9] hover:bg-white/20 transition-all carousel-nav-btn font-[Teachers] text-[1em] pointer-events-auto cursor-pointer select-none whitespace-nowrap ${
          shake ? "animate-hint-wiggle" : ""
        }`}
        onClick={onDismiss}
        aria-live="polite"
      >
        Scroll the other way :)
      </button>
    </div>
  );
}
