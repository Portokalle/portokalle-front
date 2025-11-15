'use client';
import Loader from './Loader';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    function checkUserRole() {
      try {
        const userRole = localStorage.getItem('userRole');
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          setRedirecting(true);
          // Use replace instead of push to avoid adding to history
          router.replace(fallbackPath);
          return false;
        }
        return true;
      } catch {
        setRedirecting(true);
        router.replace(fallbackPath);
        return false;
      }
    }

    // Check immediately, no artificial delay
    const authorized = checkUserRole();
    setIsAuthorized(authorized);
    setIsLoading(false);
  }, [allowedRoles, fallbackPath, router]);

  // Show loader while checking or redirecting
  if (isLoading || redirecting) {
    return <div className="flex justify-center items-center min-h-screen"><Loader /></div>;
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}
