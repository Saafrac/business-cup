import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, strokeWidth = 2.2, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const GiftIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </Icon>
);

export const BikeIcon = (p: IconProps) => (
  <Icon strokeWidth={1.7} {...p}>
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <circle cx="15" cy="5" r="1" />
    <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
  </Icon>
);

export const TelescopeIcon = (p: IconProps) => (
  <Icon strokeWidth={1.7} {...p}>
    <path d="M3 14l12-6 2 4-12 6zM15 8l4-2 2 4-4 2M9 17l-2 4M11 16l2 5" />
  </Icon>
);

export const PaletteIcon = (p: IconProps) => (
  <Icon strokeWidth={1.7} {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8zM7.5 11.5h.01M10.5 7.5h.01M15.5 7.5h.01" />
  </Icon>
);

export const QrIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="M14 14h3v3h-3zM17 20h4v-3" />
  </Icon>
);

export const SparkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
  </Icon>
);

export const RefreshIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
    <path d="M3 21v-5h5" />
  </Icon>
);

export const LockIcon =(p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon strokeWidth={2.6} {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Icon>
);

export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Icon>
);

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Icon>
);

export const CameraIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);

export const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-9 9" />
  </Icon>
);

export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon strokeWidth={2.6} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon strokeWidth={2.6} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon strokeWidth={2.8} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);

export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon strokeWidth={3} {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);
