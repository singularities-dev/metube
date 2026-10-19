/**
 * English (UK): the source catalogue. Every other language must have exactly
 * these keys, checked by the Catalog type and by i18n.test.ts.
 */
import type { Message } from '../../index.ts';
import common from './common.ts';
import app from './app.ts';
import lang from './lang.ts';
import rating from './rating.ts';
import dismiss from './dismiss.ts';
import category from './category.ts';
import reason from './reason.ts';
import uncharted from './uncharted.ts';
import error from './error.ts';
import moodSeed from './moodSeed.ts';
import explore from './explore.ts';
import tile from './tile.ts';
import player from './player.ts';
import activity from './activity.ts';
import chart from './chart.ts';
import settings from './settings.ts';
import apiKey from './apiKey.ts';
import about from './about.ts';
import engagement from './engagement.ts';
import sync from './sync.ts';
import howto from './howto.ts';
import importPanel from './import.ts';
import moodPicker from './moodPicker.ts';
import moodEditor from './moodEditor.ts';
import tagInput from './tagInput.ts';
import tags from './tags.ts';
import note from './note.ts';
import manifest from './manifest.ts';

/** One file per namespace; every key in a file starts with its namespace and a dot. */
export const namespaces = {
  common,
  app,
  lang,
  rating,
  dismiss,
  category,
  reason,
  uncharted,
  error,
  moodSeed,
  explore,
  tile,
  player,
  activity,
  chart,
  settings,
  apiKey,
  about,
  engagement,
  sync,
  howto,
  import: importPanel,
  moodPicker,
  moodEditor,
  tagInput,
  tags,
  note,
  manifest,
};

export const en = {
  ...common,
  ...app,
  ...lang,
  ...rating,
  ...dismiss,
  ...category,
  ...reason,
  ...uncharted,
  ...error,
  ...moodSeed,
  ...explore,
  ...tile,
  ...player,
  ...activity,
  ...chart,
  ...settings,
  ...apiKey,
  ...about,
  ...engagement,
  ...sync,
  ...howto,
  ...importPanel,
  ...moodPicker,
  ...moodEditor,
  ...tagInput,
  ...tags,
  ...note,
  ...manifest,
};

export type MessageKey = keyof typeof en;
/** A complete translation: every English key, each with a message. */
export type Catalog = Record<MessageKey, Message>;
