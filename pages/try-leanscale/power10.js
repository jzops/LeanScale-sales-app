import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Power10Redirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/try-leanscale/diagnostic?tab=power10');
  }, [router]);

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
