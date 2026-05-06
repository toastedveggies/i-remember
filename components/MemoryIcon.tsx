export type MemoryIconName =
  | "home"
  | "clock"
  | "calendar"
  | "mapPin"
  | "shield"
  | "phone"
  | "checkCircle"
  | "compass";

type MemoryIconProps = {
  name: MemoryIconName;
  className?: string;
  title?: string;
};

export default function MemoryIcon({ name, className, title }: MemoryIconProps) {
  const common = {
    className,
    role: title ? "img" : "presentation",
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    focusable: "false",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg"
  } as const;

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path
            d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path
            d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 12h3M13 12h3M8 16h3M13 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "mapPin":
      return (
        <svg {...common}>
          <path
            d="M12 22s7-4.5 7-12a7 7 0 0 0-14 0c0 7.5 7 12 7 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path
            d="M12 2 20 6v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 12.2 11.6 14.3 15.8 10.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path
            d="M22 16.5v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.8 2.7a2 2 0 0 1-.5 2.2L8.1 10a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.2-.5c.8.4 1.8.7 2.7.8a2 2 0 0 1 1.7 2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "checkCircle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8.5 12.2 10.7 14.4 15.8 9.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M14.8 9.2 13.7 13.7 9.2 14.8 10.3 10.3 14.8 9.2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

