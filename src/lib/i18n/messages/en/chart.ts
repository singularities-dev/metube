import type { Messages } from '../../index.ts';

/** Bar charts: the screen-reader summary and the table view under each chart. */
export default {
  // Follows the chart's description. {label} is the busiest bar (a month such as "Oct 2026" or an hour such as "07:00"), {value} its count with the unit, such as "12 videos".
  'chart.busiest': 'Busiest: {label}, {value}.',
  'chart.showTable': 'Show as table',
  // Table column heading: the month or hour each bar stands for.
  'chart.period': 'Period',
} satisfies Messages;
