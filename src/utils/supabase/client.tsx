import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Helper function to make API calls to our Edge Functions
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-f2f8e889${endpoint}`;
  
  // Get access token from localStorage for authenticated requests
  const accessToken = localStorage.getItem('timetracker_access_token');
  
  // Use access token for authenticated requests, fallback to anon key for auth endpoints
  const authToken = accessToken && !endpoint.startsWith('/auth') ? 
    `Bearer ${accessToken}` : 
    `Bearer ${publicAnonKey}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
};