import { MobileShell } from '@/components/layout/mobile-shell';
import { getCurrentUserSession } from '@/features/profile/queries';

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  return (
    <MobileShell
      isAuthenticated={session.isAuthenticated}
      displayName={session.displayName}
    >
      {children}
    </MobileShell>
  );
}
