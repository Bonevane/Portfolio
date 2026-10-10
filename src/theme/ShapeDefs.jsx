import { shapes, shapePath } from "./shapes.js";

// Every M3 shape as a reusable clip path: `clip-path: url(#m3-cookie9)`.
export default function ShapeDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        {Object.keys(shapes).map((name) => (
          <clipPath key={name} id={`m3-${name}`} clipPathUnits="objectBoundingBox">
            <path d={shapePath(name)} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}
