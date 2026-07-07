import { UserWorkspace } from '../types';

export class WorkspaceRepository {
  async save(workspace: UserWorkspace): Promise<UserWorkspace> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<UserWorkspace | null> {
    throw new Error('Not implemented');
  }
}
