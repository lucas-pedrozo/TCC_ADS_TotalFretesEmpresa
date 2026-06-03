import { cva, type VariantProps } from "class-variance-authority";

import {
  COMPANY_LOGO_ASPECT,
  companyLogoSurfaceClassName,
} from "@/constants/companyLogo";
import { cn } from "@/lib/utils";

const companyLogoVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
    companyLogoSurfaceClassName
  ),
  {
    variants: {
      size: {
        header: "h-8 w-auto max-w-[4.8125rem] aspect-[200/83]",
        menu: "h-12 w-auto max-w-[7.25rem] aspect-[200/83]",
        profile: "w-full max-w-[200px] aspect-[200/83]",
      },
    },
    defaultVariants: {
      size: "header",
    },
  }
);

const fallbackTextVariants = cva(
  "flex size-full items-center justify-center bg-brand-green-dark font-semibold text-white",
  {
    variants: {
      size: {
        header: "text-[10px]",
        menu: "text-xs",
        profile: "text-lg md:text-xl",
      },
    },
    defaultVariants: {
      size: "header",
    },
  }
);

type CompanyLogoProps = VariantProps<typeof companyLogoVariants> & {
  imageUrl?: string | null;
  alt: string;
  initials: string;
  className?: string;
};

export function CompanyLogo({
  imageUrl,
  alt,
  initials,
  size,
  className,
}: CompanyLogoProps) {
  return (
    <div
      className={cn(companyLogoVariants({ size }), className)}
      style={{ aspectRatio: COMPANY_LOGO_ASPECT }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="size-full object-contain p-0.5"
        />
      ) : (
        <div className={cn(fallbackTextVariants({ size }))}>{initials}</div>
      )}
    </div>
  );
}
