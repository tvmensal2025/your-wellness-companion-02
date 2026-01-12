
import React from 'react';
import { User } from '@supabase/supabase-js';
import { UserSessionsCompact } from '@/components/sessions';

interface SessionsPageProps {
  user: User | null;
}

export default function SessionsPage({ user }: SessionsPageProps) {
  return (
    <div className="min-h-screen bg-background px-4 pt-2">
      <UserSessionsCompact user={user} />
    </div>
  );
}
