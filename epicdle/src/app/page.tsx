import styles from "./page.module.css";
import Menu from "@/components/Menu/Menu";
import EpicdleTitle from "@/components/Epicdle/EpicdleTitle";

export default function Home() {
  return (
    <main className={styles.page}>
      <EpicdleTitle />
      <div>Get 6 chances to guess the Epic: The Musical song!</div>
      <div>Log in to see your streak!</div>
      <div>The song resets in 1 hour.</div>
      <Menu />
    </main>
  );
}
