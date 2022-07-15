import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO

  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/">
          <a>
            <Image src="/images/logo.svg" alt="logo" height="25" width="222" />
          </a>
        </Link>
      </div>
    </header>
  );
}
