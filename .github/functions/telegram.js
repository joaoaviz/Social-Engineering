const json = (obj, init = {}) => new Response(JSON.stringify(obj), {
  headers: { 'Content-Type': 'application/json', ...(init.headers || {}), 'Access-Control-Allow-Origin': '*' },
  status: init.status || 200
});

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  }});

export const onRequestGet = async () =>
  json({ ok: true, message: 'Use POST with JSON { email } to submit.' });

export const onRequestPost = async ({ request, env }) => {
  if (!env?.TELEGRAM_TOKEN || !env?.TELEGRAM_CHAT_ID) {
    return json({ error: 'Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID' }, { status: 500 });
  }
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return json({ error: 'Expected application/json' }, { status: 400 });
  }
  const { email = '' } = await request.json().catch(() => ({}));
  if (!email.trim()) {
    return json({ error: 'Missing email' }, { status: 400 });
  }
  const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `New submission: ${email}` })
  });
  const data = await resp.json();
  return json(data, { status: resp.status });
};
