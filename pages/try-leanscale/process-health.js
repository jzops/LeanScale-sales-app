import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCustomer } from '../../context/CustomerContext';

export default function ProcessHealthRedirect() {
  const router = useRouter();
  const { customerPath } = useCustomer();

  useEffect(() => {
    router.replace(customerPath('/try-leanscale/diagnostic?tab=processes'));
  }, [router, customerPath]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: '#6b7280',
    }}>
      Redirecting to diagnostic dashboard...
    </div>
  );
}
