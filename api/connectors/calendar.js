import { dispatchTools } from '../_dispatch.js';
import { sendJson } from '../_http.js';

export const CALENDAR_TOOLS = [
  { name: 'calendar_list_calendars', method: 'GET', path: '/users/me/calendarList', level: 1 },
  { name: 'calendar_list_events', method: 'GET', path: '/calendars/primary/events', level: 1 },
  { name: 'calendar_get_event', method: 'GET', path: '/calendars/primary/events/{event_id}', level: 1 },
  { name: 'calendar_create_event', method: 'POST', path: '/calendars/primary/events', level: 2 },
  { name: 'calendar_update_event', method: 'PATCH', path: '/calendars/primary/events/{event_id}', level: 3 },
  { name: 'calendar_suggest_time', method: 'POST', path: '/freeBusy', level: 1 },
];

async function special(tool, params, token, res) {
  if (tool.name !== 'calendar_suggest_time') return false;
  const timeMin = params.time_min || new Date().toISOString();
  const timeMax = params.time_max || new Date(Date.now() + 7 * 86400000).toISOString();
  let upstream;
  try {
    upstream = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
      body: JSON.stringify({ timeMin, timeMax, items: [{ id: params.calendar_id || 'primary' }] }),
    });
  } catch (e) {
    sendJson(res, 502, { error: 'upstream_unreachable' });
    return true;
  }
  const data = await upstream.json().catch(() => ({}));
  const busy = (((data.calendars || {}).primary || {}).busy) || [];
  let cursor = new Date(timeMin).getTime();
  const end = new Date(timeMax).getTime();
  const slot = 60 * 60 * 1000;
  let suggestion = null;
  busy.forEach((span) => {
    const start = new Date(span.start).getTime();
    if (!suggestion && start - cursor >= slot) suggestion = new Date(cursor).toISOString();
    cursor = Math.max(cursor, new Date(span.end).getTime());
  });
  if (!suggestion && end - cursor >= slot) suggestion = new Date(cursor).toISOString();
  sendJson(res, upstream.status, { busy, suggestion, timeMin, timeMax });
  return true;
}

export default function handler(req, res) {
  return dispatchTools(req, res, {
    tools: CALENDAR_TOOLS,
    base: 'https://www.googleapis.com/calendar/v3',
    special,
  });
}
