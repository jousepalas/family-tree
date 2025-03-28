'use client'; // This hook runs on the client

import { useState, useEffect } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
}

const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true, // Start in loading state
  });

  useEffect(() => {
    // Check for token in localStorage only after mount on client
    const token = localStorage.getItem('authToken');
    setAuthState({
      isLoggedIn: !!token, // Set isLoggedIn based on token presence
      isLoading: false, // Finished loading check
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  return authState;
};

export default useAuth;