import styles from "./page.module.css";
import Menu from "@/components/Menu/Menu";
import EpicdleTitle from "@/components/Text/Epicdle/EpicdleTitle";
import CountdownTimer from "@/components/CountdownTimer/CountdownTimer";

export default function Home() {
  return (
    <main className={styles.page}>
      <EpicdleTitle />
      <div>Get 6 chances to guess the Epic: The Musical song!</div>
      <CountdownTimer />
      <Menu />
    </main>
  );
}
