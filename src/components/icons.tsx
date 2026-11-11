import type { ReactNode } from "react";

type IconProps = { className?: string };

function Base({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className ?? "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Kumpulan icon inline SVG (background transparan). Jangan pakai emoji sebagai icon. */

export function IconBriefcase({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M3 13h18" />
    </Base>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </Base>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <circle cx="17" cy="9" r="3" />
      <path d="M16.5 14.6c2.7.4 4.7 2 4.7 5.4" />
    </Base>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 16V4" />
      <path d="M6 10l6-6 6 6" />
      <path d="M4 20h16" />
    </Base>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 4v12" />
      <path d="M6 10l6 6 6-6" />
      <path d="M4 20h16" />
    </Base>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Base>
  );
}

export function IconFileText({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </Base>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </Base>
  );
}

export function IconXCircle({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </Base>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

export function IconLogOut({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Base>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9 6l6 6-6 6" />
    </Base>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Base>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </Base>
  );
}

export function IconGraduation({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M2 9l10-5 10 5-10 5L2 9z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v5" />
    </Base>
  );
}

export function IconClipboard({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 12h6M9 16h4" />
    </Base>
  );
}

export function IconShieldCheck({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </Base>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </Base>
  );
}

export function IconPencil({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M17 3l4 4L8 20l-5 1 1-5L17 3z" />
    </Base>
  );
}

export function IconFilter({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </Base>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </Base>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6M14 11v6" />
    </Base>
  );
}

export function IconMapPin({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Base>
  );
}

export function IconBuilding({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
      <path d="M10 21v-3h4v3" />
    </Base>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Base>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Base>
  );
}
