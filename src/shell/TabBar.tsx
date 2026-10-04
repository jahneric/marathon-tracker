import { BookOpen, CalendarDays, ChartColumn, ListChecks, Settings2, type AppIcon } from '@/ui/icons';
import { routeHref, type Tab } from '@/hooks/useRoute';
import styles from './TabBar.module.css';

const ITEMS: { tab: Tab; label: string; Icon: AppIcon }[] = [
  { tab: 'heute', label: 'Heute', Icon: CalendarDays },
  { tab: 'plan', label: 'Plan', Icon: ListChecks },
  { tab: 'statistik', label: 'Statistik', Icon: ChartColumn },
  { tab: 'infos', label: 'Infos', Icon: BookOpen },
  { tab: 'mehr', label: 'Mehr', Icon: Settings2 },
];

export function TabBar({ active }: { active: Tab }) {
  return (
    <nav className={styles.bar} aria-label="Hauptnavigation">
      <div className={styles.brand}>
        <img src="icon.svg" alt="" width={32} height={32} />
        <span>Marathon 2027</span>
      </div>
      {ITEMS.map(({ tab, label, Icon }) => (
        <a key={tab} href={routeHref({ tab })} className={styles.item} aria-current={active === tab ? 'page' : undefined}>
          <Icon aria-hidden />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
