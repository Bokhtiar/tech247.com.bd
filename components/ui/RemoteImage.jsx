import Image from "next/image";

export default function RemoteImage({ src, alt = "", className = "", sizes = "240px", priority = false }) {
  if (!src) {
    return <div className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
