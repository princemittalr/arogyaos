import { UserWorkspace } from '../types';
import { WorkspaceRepository } from '../repositories';

export class WorkspaceService {
  constructor(private readonly workspaceRepo: WorkspaceRepository) {}

  async manageWorkspaceMetadata(workspace: Partial<UserWorkspace>): Promise<UserWorkspace> {
    throw new Error('Not implemented');
  }
}
