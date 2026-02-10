import Head from 'next/head';
import Navigation from './Navigation';
import { useCustomer } from '../context/CustomerContext';

export default function Layout({ children, title = "LeanScale" }) {
  const { displayName } = useCustomer();
  const pageTitle = displayName ? `${displayName} | ${title}` : title;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="LeanScale - GTM Operations for Hypergrowth Startups" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Navigation />
      <main>{children}</main>
    </>
  );
}
