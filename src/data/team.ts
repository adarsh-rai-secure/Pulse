import type { TeamMember } from '../types';

export const TEAM: TeamMember[] = [
  {
    id: 'csm',
    name: 'Alex Rivera',
    role: 'Customer Success, Retention',
    email: 'alex.rivera@pulse.example',
  },
  {
    id: 'se_lead',
    name: 'Jordan Park',
    role: 'Director, Solutions Engineering',
    email: 'jordan.park@pulse.example',
  },
  {
    id: 'se',
    name: 'Sam Chen',
    role: 'Senior Solutions Engineer',
    email: 'sam.chen@pulse.example',
  },
  {
    id: 'adoption',
    name: 'Morgan Lee',
    role: 'Adoption Specialist',
    email: 'morgan.lee@pulse.example',
  },
  {
    id: 'expansion',
    name: 'Taylor Kim',
    role: 'Account Executive, Expansion',
    email: 'taylor.kim@pulse.example',
  },
];

export function getMember(id: string): TeamMember {
  return TEAM.find((m) => m.id === id) ?? TEAM[0];
}
