import '../styles/globals.css';
import { CustomerProvider } from '../context/CustomerContext';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CustomerProvider initialCustomer={pageProps.customer}>
        <Component {...pageProps} />
      </CustomerProvider>
    </AuthProvider>
  );
}
