import '../styles/globals.css';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { CustomerProvider } from '../context/CustomerContext';
import { AuthProvider } from '../context/AuthContext';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Build marker: 2026-01-29-v2
export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <AuthProvider>
      <CustomerProvider initialCustomer={pageProps.customer}>
        <AnimatePresence mode="wait">
          <motion.div
            key={router.asPath}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </CustomerProvider>
    </AuthProvider>
  );
}
