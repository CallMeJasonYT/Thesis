import { useId } from "react";

export function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentPropsWithoutRef<"svg"> & {
  width: number;
  height: number;
  x: string | number;
  y: string | number;
  squares: Array<[x: number, y: number]>;
}) {
  const patternId = useId();

  // Define cube dimensions
  const cubeWidth = width;
  const cubeHeight = height;

  const createCube = (xPos: number, yPos: number) => {
    const top = [
      [xPos, yPos],
      [xPos + cubeWidth / 2, yPos - cubeHeight / 2],
      [xPos + cubeWidth, yPos],
      [xPos + cubeWidth / 2, yPos + cubeHeight / 2],
    ];

    const left = [
      [xPos, yPos],
      [xPos + cubeWidth / 2, yPos + cubeHeight / 2],
      [xPos + cubeWidth / 2, yPos + cubeHeight * 1.5],
      [xPos, yPos + cubeHeight],
    ];

    const right = [
      [xPos + cubeWidth, yPos],
      [xPos + cubeWidth / 2, yPos + cubeHeight / 2],
      [xPos + cubeWidth / 2, yPos + cubeHeight * 1.5],
      [xPos + cubeWidth, yPos + cubeHeight],
    ];

    const toPath = (points: number[][]) =>
      points.map((p) => p.join(",")).join(" ");

    return (
      <g key={`${xPos}-${yPos}`}>
        <polygon points={toPath(top)} fill="#ccc" />
        <polygon points={toPath(left)} fill="#999" />
        <polygon points={toPath(right)} fill="#666" />
      </g>
    );
  };

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy]) => {
            const xPos = sx * cubeWidth;
            const yPos = sy * cubeHeight;
            return createCube(xPos, yPos);
          })}
        </svg>
      )}
    </svg>
  );
}
