import { ProjectIndexStatus } from '../projects/project.entity';

export type IndexOutcome = 'start' | 'complete' | 'fail' | 'clear';

export function indexStatusForOutcome(outcome: IndexOutcome): ProjectIndexStatus {
  const statuses: Record<IndexOutcome, ProjectIndexStatus> = {
    start: ProjectIndexStatus.INDEXING,
    complete: ProjectIndexStatus.INDEXED,
    fail: ProjectIndexStatus.FAILED,
    clear: ProjectIndexStatus.NOT_INDEXED,
  };
  return statuses[outcome];
}
