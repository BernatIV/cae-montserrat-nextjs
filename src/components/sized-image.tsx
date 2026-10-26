import Image from "next/image";
import { getLocalImageSize } from "@/lib/images";

type SizedImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
};

/** next/image for a file in `public/`, using its real dimensions. */
export function SizedImage({ src, alt, sizes, className, preload }: SizedImageProps) {
  const size = getLocalImageSize(src) ?? { width: 1200, height: 900 };
  return (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      sizes={sizes}
      preload={preload}
      fetchPriority={preload ? "high" : undefined}
      className={className}
    />
  );
}
