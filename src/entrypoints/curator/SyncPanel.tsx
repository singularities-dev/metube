import { Fragment, useCallback, useEffect, useState, type ReactNode } from 'react';
import { openMeTubeDB } from '@/lib/db';
import { client, oauthClientId, quota } from '@/lib/services';
import { pendingSync, syncRatings, RATE_COST, type SyncResult } from '@/lib/sync';
import { pendingSubscriptionChanges, pullSubscriptions, pushSubscriptions, type PullResult, type PushResult } from '@/lib/subscriptions';
import { redirectUrl, signIn } from '@/lib/oauth';
import type { Prefs } from '@/lib/prefs';
import type { Translate } from '@/lib/i18n/catalogs';
import { CopyField, HowTo, CLOUD_CONSOLE } from './HowTo';
import { ErrorText, errorMessage, T, useI18n } from './i18n';

const CLIENT_ID_SHAPE = /^[\w-]+\.apps\.googleusercontent\.com$/;
/** Units a sync always leaves for the feed (the default reserve of syncRatings and pushSubscriptions). */
const FEED_RESERVE = 1000;
const OAUTH_SCOPE = '…/auth/youtube.force-ssl';

/** Why a batch stopped early, as a sentence. `cause` is what was thrown, worded by errorMessage. */
function stopReason(why: PushResult['stoppedBecause'] | SyncResult['stoppedBecause'], cause: unknown, t: Translate): string {
  switch (why) {
    case 'auth': return t('error.auth');
    case 'quota': return t('error.quota');
    case 'refused': return t('error.refused');
    case 'cap': return t('sync.stopped.cap');
    case 'budget': return t('sync.stopped.budget', { reserve: FEED_RESERVE });
    default: return cause !== undefined ? errorMessage(cause, t) : t('sync.stopped.unknown');
  }
}

/** Subscriptions stopped at the per-sync limit or the feed reserve, which ratings share. */
const sharedStop = (push: PushResult) => push.stoppedBecause === 'cap' || push.stoppedBecause === 'budget';

function describeSubs(pull: PullResult, push: PushResult, t: Translate): string[] {
  const sentences = [t('sync.result.subsRead', { count: pull.total })];
  if (pull.added) sentences.push(t('sync.result.subsAdded', { count: pull.added }));
  if (pull.removed) sentences.push(t('sync.result.subsRemoved', { count: pull.removed }));
  if (push.subscribed) sentences.push(t('sync.result.subscribed', { count: push.subscribed }));
  if (push.unsubscribed) sentences.push(t('sync.result.unsubscribed', { count: push.unsubscribed }));
  if (push.gone) sentences.push(t('sync.result.subsGone', { count: push.gone }));
  if (push.remaining) {
    sentences.push(t('sync.result.subsLeft', { count: push.remaining }));
    // The limit and the reserve are shared with ratings, so sync() says those once, after them.
    if (!sharedStop(push)) sentences.push(stopReason(push.stoppedBecause, push.cause, t));
  }
  return sentences;
}

function describe(r: SyncResult, t: Translate): string[] {
  const sentences = [t('sync.result.ratingsSent', { count: r.synced })];
  if (r.gone) sentences.push(t('sync.result.ratingsGone', { count: r.gone }));
  if (r.remaining) sentences.push(t('sync.result.ratingsLeft', { count: r.remaining }), stopReason(r.stoppedBecause, r.cause, t));
  return sentences;
}

/** A message whose {placeholders} are elements rather than text (which T can't do), with the words between muted. */
function Sentence({ text, parts }: { text: string; parts: Record<string, ReactNode> }) {
  return (
    <>
      {text.split(/\{(\w+)\}/).map((s, i) =>
        i % 2 ? <Fragment key={i}>{parts[s]}</Fragment> : s && <span key={i} className="muted">{s}</span>,
      )}
    </>
  );
}

export function SyncPanel({ prefs, updatePrefs, onSynced }: { prefs: Prefs; updatePrefs: (p: Partial<Prefs>) => void; onSynced: () => void }) {
  const { t, fmt, locale } = useI18n();
  const [saved, setSaved] = useState<string>();
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(0);
  const [pendingSubs, setPendingSubs] = useState(0);
  const [busy, setBusy] = useState(false);
  // How to word the outcome rather than its words, so a language switch rewords it.
  const [status, setStatus] = useState<{ ok: boolean; text: (t: Translate) => string } | { ok: false; error: unknown }>();
  const redirect = redirectUrl();

  const countPending = useCallback(async () => {
    const db = await openMeTubeDB();
    setPending(pendingSync(await db.getAll('feedback')).length);
    setPendingSubs(pendingSubscriptionChanges(await db.getAll('subscriptions')).length);
  }, []);

  useEffect(() => {
    void oauthClientId.get().then(setSaved);
    void countPending();
  }, [countPending]);

  async function save() {
    const id = draft.trim();
    if (!CLIENT_ID_SHAPE.test(id)) {
      setStatus({ ok: false, text: (t) => t('sync.clientId.invalid') });
      return;
    }
    await oauthClientId.set(id);
    setSaved(id);
    setDraft('');
    setStatus({ ok: true, text: (t) => t('sync.saved', { button: t('sync.now') }) });
  }

  async function sync() {
    if (!saved) return;
    setBusy(true);
    setStatus(undefined);
    try {
      // Google's sign-in screens follow MeTube's language, so the guide's button names match.
      const token = await signIn(saved, locale);
      const db = await openMeTubeDB();
      const before = await quota.remaining();
      // Subscriptions first: read YouTube's list (cheap), then send MeTube's changes.
      const pull = await pullSubscriptions(db, client, token.token);
      const push = await pushSubscriptions(db, client, token.token, { cap: prefs.syncCap, remainingUnits: await quota.remaining() });
      const subsBlocked = push.stoppedBecause === 'auth' || push.stoppedBecause === 'quota';
      const sent = push.subscribed + push.unsubscribed + push.gone;
      const result = subsBlocked
        ? undefined
        : await syncRatings(db, client, token.token, { cap: Math.max(0, prefs.syncCap - sent), remainingUnits: await quota.remaining() });
      const units = before - (await quota.remaining());
      const ok = !subsBlocked && push.stoppedBecause !== 'refused' && push.stoppedBecause !== 'error' && push.stoppedBecause !== 'budget'
        && (!result?.stoppedBecause || result.stoppedBecause === 'cap');
      // Subscription changes left at the limit or the reserve: say why once, unless the ratings already did.
      const subsReason = push.remaining > 0 && sharedStop(push) && !(result?.remaining && result.stoppedBecause === push.stoppedBecause);
      setStatus({
        ok,
        text: (t) => [
          ...describeSubs(pull, push, t),
          ...(result ? describe(result, t) : []),
          ...(subsReason ? [stopReason(push.stoppedBecause, undefined, t)] : []),
          t('common.unitsUsed', { count: units }),
        ].join(' '),
      });
      onSynced();
    } catch (e) {
      setStatus({ ok: false, error: e });
    } finally {
      setBusy(false);
      void countPending();
    }
  }

  const thisSync = Math.min(pending + pendingSubs, prefs.syncCap);
  const count = <span className="sync-count" />;
  const muted = <span className="muted" />;
  // <b> names Google Cloud Console screens and fields, kept in English; <em> is translated emphasis.
  const b = <strong lang="en" />;
  const em = <strong />;
  const syncNow = t('sync.now');

  return (
    <section className="panel glass">
      <h2>{t('sync.title')}</h2>
      <p className="muted">
        {t('sync.intro')}{' '}
        {t('sync.intro.ratings', { love: t('rating.2.short'), like: t('rating.1.short'), dislike: t('rating.-1.short'), hate: t('rating.-2.short') })}
      </p>

      {saved ? (
        <>
          <div className="sync-status">
            <div>
              <Sentence
                text={t('sync.pending')}
                parts={{
                  ratings: <T k="sync.pending.ratings" params={{ count: pending }} components={{ n: count, m: muted }} />,
                  subs: <T k="sync.pending.subs" params={{ count: pendingSubs }} components={{ n: count, m: muted }} />,
                }}
              />
            </div>
            <button className="button" onClick={sync} disabled={busy}>
              {busy ? t('sync.syncing') : syncNow}
            </button>
          </div>
          <p className="hint">
            {t('sync.hint.cost', { count: thisSync, cost: RATE_COST, total: thisSync * RATE_COST })}{' '}
            {t('sync.hint.reserve', { reserve: FEED_RESERVE })}
          </p>
          <label className="setting">
            <span className="setting-text">
              <span className="setting-label">{t('sync.cap.label')}</span>
              <span className="setting-hint">{t('sync.cap.hint', { count: prefs.syncCap * RATE_COST })}</span>
            </span>
            <span className="range">
              <input type="range" min={5} max={150} step={5} value={prefs.syncCap} onChange={(e) => updatePrefs({ syncCap: Number(e.target.value) })} />
              <output>{fmt.number(prefs.syncCap)}</output>
            </span>
          </label>
          <div className="row">
            <span className="muted">{t('sync.clientId')}</span>
            <code>{saved.slice(0, 10)}…apps.googleusercontent.com</code>
            <button className="button secondary small" onClick={async () => { await oauthClientId.clear(); setSaved(undefined); setStatus(undefined); }}>
              {t('common.remove')}
            </button>
          </div>
        </>
      ) : (
        <form className="row" onSubmit={(e) => { e.preventDefault(); void save(); }}>
          <input
            className="field"
            spellCheck={false}
            autoComplete="off"
            placeholder={t('sync.clientId.placeholder')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label={t('sync.clientId.field')}
          />
          <button className="button" type="submit" disabled={!draft.trim()}>{t('common.save')}</button>
        </form>
      )}
      <p className={status?.ok === false ? 'error' : 'muted'} role="status">
        {status && ('error' in status ? <ErrorText error={status.error} /> : status.text(t))}
      </p>

      <HowTo
        title={t('sync.howto.title')}
        steps={[
          <T k="sync.howto.project" components={{ em, link: <a href={CLOUD_CONSOLE} target="_blank" rel="noopener noreferrer" /> }} />,
          <>
            <T k="sync.howto.consent" components={{ b }} />{' '}
            <T k="sync.howto.scopes" params={{ scope: OAUTH_SCOPE }} components={{ b, code: <code /> }} />
          </>,
          <T k="sync.howto.client" components={{ b }} />,
          <>
            <T k="sync.howto.redirect" components={{ b }} />
            <CopyField value={redirect} label={t('sync.redirectUrl')} />
          </>,
          <T k="sync.howto.copyId" components={{ b }} />,
          <T k="sync.howto.continue" params={{ button: syncNow }} components={{ em }} />,
        ]}
        note={t('sync.howto.note')}
      />
    </section>
  );
}
