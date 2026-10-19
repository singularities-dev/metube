import { LINKS } from '@/lib/links';
import { T, useI18n } from './i18n';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function AboutPanel() {
  const { t } = useI18n();
  const version = browser.runtime.getManifest().version;
  return (
    <section className="panel glass about">
      <h2>{t('about.heading')}</h2>
      <p className="muted">
        <T
          k="about.terms"
          params={{ version }}
          components={{ terms: <a href={LINKS.youtubeTerms} {...ext} />, privacy: <a href={LINKS.googlePrivacy} {...ext} /> }}
        />
      </p>
      <p className="muted">
        <T
          k="about.privacy"
          components={{ policy: <a href={LINKS.privacy} {...ext} />, permissions: <a href={LINKS.googlePermissions} {...ext} /> }}
        />
      </p>
      <p className="muted">
        <T k="about.licence" components={{ link: <a href={LINKS.license} {...ext} /> }} />{' '}
        <a href={LINKS.source} {...ext}>{t('about.source')}</a> · <a href={LINKS.issues} {...ext}>{t('about.issues')}</a>
      </p>
    </section>
  );
}
