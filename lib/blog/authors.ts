import { TEAM } from '@/app/meet-our-team/team-data';

/* Who a post can be credited to: the people on /meet-our-team, in that order
   (Michael first, the default). Add someone there and they appear here. */
export const BLOG_AUTHORS: string[] = TEAM.map((m) => m.name);
export const DEFAULT_AUTHOR = BLOG_AUTHORS[0];
