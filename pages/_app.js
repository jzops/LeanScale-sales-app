import '../styles/globals.css';
import { CustomerProvider } from '../context/CustomerContext';
import { AuthProvider } from '../context/AuthContext';

// Build marker: 2026-01-29-v2
export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CustomerProvider initialCustomer={pageProps.customer}>
        <Component {...pageProps} />
      </CustomerProvider>
    </AuthProvider>
  );
}
