import Image from "next/image";

export default function ModalGif({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={0}
      style={{ height: "auto", objectFit: "contain" }}
    />
  );
}
