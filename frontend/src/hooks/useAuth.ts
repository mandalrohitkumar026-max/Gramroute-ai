import { useAuth as useBaseAuth } from '../contexts/AuthContext';

/**
 * Enhanced authentication hook providing role predicates and user verification states
 */
export const useAuth = () => {
  const auth = useBaseAuth();

  return {
    ...auth,
    isFarmer: auth.activeRole === 'FARMER',
    isTransporter: auth.activeRole === 'TRANSPORTER',
    isAdmin: auth.activeRole === 'ADMIN',
    isBusiness: auth.activeRole === 'BUSINESS',
    isVerified: auth.currentUser?.verified ?? false,
    rating: auth.currentUser?.rating ?? 5.0
  };
};

export default useAuth;
