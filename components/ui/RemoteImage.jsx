import Image from "next/image";
import { resolveMediaUrl } from "@/config/api";

export default function RemoteImage({ src, alt = "", className = "", sizes = "240px", priority = false }) {
  const resolved = resolveMediaUrl(src);

  if (!resolved) {
    return <div className={className} />;
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
