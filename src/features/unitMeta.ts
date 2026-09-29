import { Dumbbell, Footprints, Moon, PersonStanding, Plus, Volleyball, type LucideIcon } from 'lucide-react';
import type { UnitType } from '@/store/types';

export const UNIT_META: Record<UnitType, { label: string; Icon: LucideIcon; color: string; soft: string }> = {
  run: { label: 'Laufen', Icon: Footprints, color: 'var(--run)', soft: 'var(--run-soft)' },
  kraft: { label: 'Kraft', Icon: Dumbbell, color: 'var(--kraft)', soft: 'var(--kraft-soft)' },
  vb: { label: 'Beachvolleyball', Icon: Volleyball, color: 'var(--vb)', soft: 'var(--vb-soft)' },
  mob: { label: 'Mobility', Icon: PersonStanding, color: 'var(--mob)', soft: 'var(--mob-soft)' },
  rest: { label: 'Ruhe', Icon: Moon, color: 'var(--rest)', soft: 'var(--rest-soft)' },
  other: { label: 'Sonstiges', Icon: Plus, color: 'var(--rest)', soft: 'var(--rest-soft)' },
};
