import { notFound } from 'next/navigation';
import { EventPage } from '@/components/taste/event-page';
import { getDemoWorkspaceForRequest } from '@/lib/server/workspace/session';
import { readEventPreview } from '@/lib/server/workspace/repository';
import './preview.css';
export const dynamic = 'force-dynamic';
export default async function EventPreview({ params }: { params: Promise<{ id: string }> }) {
  const workspace = await getDemoWorkspaceForRequest();
  if (!workspace) notFound();
  const { id } = await params;
  const preview = readEventPreview(workspace, id);
  if (!preview) notFound();
  return <EventPage preview={preview}/>;
}
