import Image from "next/image";
import styles from "./ModalGif.module.css";

export default function ModalGif({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      className={styles.gif}
      priority
    />
  );
}
