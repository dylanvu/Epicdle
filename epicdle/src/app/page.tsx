import styles from "./page.module.css";
import { Cinzel } from "next/font/google";
import Menu from "../../components/Menu/Menu";

const cinzel = Cinzel({
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={`${cinzel.className} ${styles.title}`}>Epicdle</div>
      <div>Get 6 chances to guess the Epic: The Musical song!</div>
      <div>Log in to see your streak!</div>
      <div>The song resets in 1 hour.</div>
      <Menu />
    </main>
  );
}
