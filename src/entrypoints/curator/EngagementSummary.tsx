import { useEffect, useState } from 'react';
import { loadAll, openMeTubeDB } from '@/lib/db';
import { channelEngagement, searchTerms, suggestableTerms, type ChannelEngagement, type SearchTerm } from '@/lib/engagement';
import { T, useI18n } from './i18n';

interface Summary {
  watches: number;
  channels: ChannelEngagement[];
  terms: SearchTerm[];
  lastImport?: number;
}

export function EngagementSummary({ version }: { version: number }) {
  const { t, fmt } = useI18n();
  const [s, setS] = useState<Summary>();

  useEffect(() => {
    (async () => {
      const all = await loadAll(await openMeTubeDB());
      setS({
        watches: all.watches.length,
        channels: channelEngagement(all.watches, all.subscriptions),
        terms: suggestableTerms(searchTerms(all.searches)),
        lastImport: all.imports.at(-1)?.importedAt,
      });
    })();
  }, [version]);

  if (!s) return null;
  if (!s.watches && !s.channels.length) {
    return null;
  }

  const counts = {
    watches: t('engagement.watches', { count: s.watches }),
    channels: t('engagement.channels', { count: s.channels.length }),
  };

  return (
    <section className="panel glass">
      <h2>{t('engagement.heading')}</h2>
      <p className="muted">
        {s.lastImport
          ? t('engagement.summary.imported', { ...counts, date: fmt.date(s.lastImport) })
          : t('engagement.summary', counts)}
      </p>
      <div className="columns">
        <div>
          <h3>{t('engagement.topChannels')}</h3>
          <ol>
            {s.channels.slice(0, 15).map((c) => {
              const stats = [
                t('engagement.channel.watched', { count: c.watches }),
                c.rewatchedVideos > 0 && t('engagement.channel.rewatched', { count: c.rewatchedVideos }),
                c.subscribed && t('engagement.channel.subscribed'),
              ].filter(Boolean).join(t('engagement.channel.separator'));
              return (
                <li key={c.channelId}>
                  <T k="engagement.channel.line" params={{ channel: c.channelTitle, stats }} components={{ m: <span className="muted" /> }} />
                </li>
              );
            })}
          </ol>
        </div>
        <div>
          <h3>{t('engagement.searches')}</h3>
          <ul className="chips">
            {s.terms.slice(0, 30).map((term) => (
              <li key={term.term} className="chip" title={t('engagement.searchCount', { count: term.count })}>{term.term}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
