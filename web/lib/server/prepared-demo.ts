import prepared from '../demo/prepared-taste-plan.json';
import type { CompanyBrand, EventDesignBrief } from '../contracts/company-brand';
import type { EventDraftFields, WorkspaceAgentRole, WorkspaceOpportunity } from '../contracts/agent-workspace';
import type { ResearchBrief } from '../contracts/event-gtm';
import * as repository from './workspace/repository';

export function loadPreparedDemo(workspaceId: string, previewPrefix = '/preview') {
  let snapshot = repository.readWorkspaceSnapshot(workspaceId);
  if (snapshot.latestBrief && !/^(https?:\/\/)?(www\.)?tastelabs\.com\/?$/i.test(snapshot.latestBrief.website)) throw new TypeError('This demo is for Taste Labs. Keep your current company plan and open the demo in a separate browser profile.');
  if (!snapshot.latestBrief) { repository.saveBrief(workspaceId, prepared.brief as ResearchBrief, snapshot.briefVersion); snapshot = repository.readWorkspaceSnapshot(workspaceId); }
  const currentBrand = repository.readCompanyBrand(workspaceId);
  const brand = currentBrand?.status === 'completed' && /tastelabs\.com/.test(currentBrand.sourceUrl)
    ? repository.saveCompanyBrand(workspaceId, { ...currentBrand, imagery: currentBrand.imagery?.length ? currentBrand.imagery : prepared.brand.imagery })
    : repository.saveCompanyBrand(workspaceId, prepared.brand as CompanyBrand);
  const mapping = new Map<string, string>();
  const previews: { opportunityId: string; url: string }[] = [];
  for (const event of [...prepared.events].reverse()) {
    const ref = `prepared:taste:${event.key}`;
    const existing = snapshot.opportunities.find(item => item.evidenceIds.includes(ref) || (event.catalogEventId && item.catalogEventId === event.catalogEventId) || item.title === event.title || snapshot.drafts.some(draft => draft.opportunityId === item.id && draft.fields.title === event.title));
    const opportunity = existing ?? repository.createOpportunity(workspaceId, { title: event.title, action: event.action as WorkspaceOpportunity['action'], catalogEventId: event.catalogEventId, state: event.action === 'host' ? 'proposal' : 'needs_review', rationale: event.rationale, evidenceIds: [ref, ...event.evidenceIds] });
    mapping.set(event.key, opportunity.id);
    if (event.fields) {
      const existingDraft = snapshot.drafts.find(draft => draft.opportunityId === opportunity.id);
      const fields = existingDraft?.fields ?? { ...event.fields, sourceRefs: [ref, `brief:${snapshot.briefVersion}`, brand.sourceUrl] } as EventDraftFields;
      if (!existingDraft) repository.createDraft(workspaceId, opportunity.id, fields, 'producer');
      const preview = repository.provisionEventPreview(workspaceId, { opportunityId: opportunity.id, fields, brand, design: event.design as EventDesignBrief | null });
      previews.push({ opportunityId: opportunity.id, url: `${previewPrefix}/${preview.id}` });
    }
  }
  // An example import must not replace the progress of a real run already in flight.
  const running = snapshot.runs.find(run => ['queued', 'running'].includes(run.status));
  const run = running ?? repository.recordPreparedDemoRun(workspaceId, `prepared:taste:v${prepared.version}`, prepared.sourceRunId, prepared.tasks.map(task => ({ ...task, role: task.role as WorkspaceAgentRole, opportunityId: task.eventKey ? mapping.get(task.eventKey) ?? null : null })));
  const current = repository.readWorkspaceSnapshot(workspaceId);
  for (const preview of previews) if (!current.events.some(event => event.kind === 'preview.provisioned' && event.metadata.url === preview.url)) repository.appendTimelineEvent(workspaceId, { runId: run.id, opportunityId: preview.opportunityId, role: 'producer', kind: 'preview.provisioned', message: 'Prepared event landing is ready.', metadata: { url: preview.url, prepared: true, visibility: 'private' } });
  return { workspace: repository.readWorkspaceSnapshot(workspaceId), brand, prepared: true };
}
