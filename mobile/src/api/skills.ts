/** Beceriler (skills) — /api/v1/skills/list. */
import { ApiContext, apiGet } from './client';

export type Skill = {
  id: string;
  name: string;
  description: string;
  version?: string;
  skill_type?: string;
  type?: string;
};

export async function getSkills(ctx: ApiContext): Promise<Skill[]> {
  const list = await apiGet<Skill[]>(ctx, '/api/v1/skills/list');
  return Array.isArray(list) ? list : [];
}
