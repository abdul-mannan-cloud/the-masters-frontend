const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-2xl",
};

const Avatar = ({ name, size = "md" }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div
      className={`${SIZES[size]} rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 font-headline`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
