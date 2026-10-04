import { MobilityIcon, Plus, RestIcon, RunIcon, StrengthIcon, VolleyIcon, type AppIcon } from '@/ui/icons';
import type { UnitType } from '@/store/types';

export const UNIT_META: Record<UnitType, { label: string; Icon: AppIcon; color: string; soft: string }> = {
  run: { label: 'Laufen', Icon: RunIcon, color: 'var(--run)', soft: 'var(--run-soft)' },
  kraft: { label: 'Kraft', Icon: StrengthIcon, color: 'var(--kraft)', soft: 'var(--kraft-soft)' },
  vb: { label: 'Beachvolleyball', Icon: VolleyIcon, color: 'var(--vb)', soft: 'var(--vb-soft)' },
  mob: { label: 'Mobility', Icon: MobilityIcon, color: 'var(--mob)', soft: 'var(--mob-soft)' },
  rest: { label: 'Ruhe', Icon: RestIcon, color: 'var(--rest)', soft: 'var(--rest-soft)' },
  other: { label: 'Sonstiges', Icon: Plus, color: 'var(--rest)', soft: 'var(--rest-soft)' },
};
