// Bare shimmering block — compose with width/height utility classes at the
// call site, e.g. <Skeleton className="h-4 w-32" />. Uses the `.skeleton`
// class from index.css (gradient + the `shimmer` keyframe from
// tailwind.config.js) rather than Tailwind's built-in `animate-pulse`, since
// a moving highlight reads as "content is arriving" rather than "blinking".
export const Skeleton = ({ className = "", style }) => (
  <div className={`skeleton rounded-lg ${className}`} style={style} />
);

// Drop-in replacement for a loading spinner inside a <table className="masters-table">
// body — mirrors the real column count so the table doesn't visibly
// reflow once data arrives.
export const SkeletonTableRows = ({ rows = 5, columns = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r}>
        {Array.from({ length: columns }).map((_, c) => (
          <td key={c}>
            <Skeleton className="h-4" style={{ width: c === 0 ? "70%" : "45%" }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default Skeleton;
