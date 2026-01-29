import '../styles/globals.css';
import { CustomerProvider } from '../context/CustomerContext';

export default function App({ Component, pageProps }) {
  return (
    <CustomerProvider initialCustomer={pageProps.customer}>
      <Component {...pageProps} />
    </CustomerProvider>
  );
}
