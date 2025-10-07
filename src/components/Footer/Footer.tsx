import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>An Epic: The Musical fan game coded by Dylan</div>
      <div>
        <p>
          I'm just a humble developer who codes for fun. This is a completely
          free, fan-made project created out of love for the musical.
        </p>
        <p>
          If you enjoy the game and would like to support me to help cover the
          game server maintenance and other costs coming out of my own pocket,
          you can do so{" "}
          <a
            href="https://buymeacoffee.com/dylanvu"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "underline",
            }}
          >
            here
          </a>
          !
        </p>
        <p>
          Support is never required to enjoy all features of the game! It's just
          a way to help keep the project running.
        </p>
        <p>
          <strong>
            I am not affiliated with Jorge Rivera-Herrans, any members of the
            EPIC cast, or Winion Entertainment LLC in any way. All rights to the
            original music and album art belong to their respective owners. If
            you'd like to support the official creators, please support their
            channels/socials and listen to Epic: The Musical!
          </strong>
        </p>
      </div>
    </footer>
  );
}
