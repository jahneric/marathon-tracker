import { useEffect } from 'react';
import { InfoView } from '@/features/info/InfoView';
import { PlanView } from '@/features/plan/PlanView';
import { SettingsView } from '@/features/settings/SettingsView';
import { StatsView } from '@/features/stats/StatsView';
import { TodayView } from '@/features/today/TodayView';
import { parseHash, useHash } from '@/hooks/useRoute';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { useAppState } from '@/store/store';
import { FeedbackHost } from '@/ui/FeedbackHost';
import { TabBar } from '@/shell/TabBar';
import { TopBar } from '@/shell/TopBar';
import { UpdatePrompt } from '@/shell/UpdatePrompt';
import styles from './App.module.css';

export function App() {
  const state = useAppState();
  const today = useToday();
  const route = parseHash(useHash());
  useTheme(state.settings.theme);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.tab]);

  return (
    <div className={styles.shell}>
      <TabBar active={route.tab} />
      <div className={styles.column}>
        <TopBar state={state} today={today} />
        <main className={styles.main}>
          {route.tab === 'heute' && <TodayView state={state} today={today} date={route.date ?? today} />}
          {route.tab === 'plan' && <PlanView state={state} today={today} />}
          {route.tab === 'statistik' && <StatsView state={state} today={today} />}
          {route.tab === 'infos' && <InfoView state={state} />}
          {route.tab === 'mehr' && <SettingsView state={state} />}
        </main>
      </div>
      <UpdatePrompt />
      <FeedbackHost />
    </div>
  );
}
