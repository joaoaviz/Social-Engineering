const json = (obj, init = {}) => new Response(JSON.stringify(obj), { headers: { 'Content-Type': 'application/json', ...(init.headers || {}), 'Access-Control-Allow-Origin': '*' }, status: init.status || 200 });

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};

export const onRequestGet = async ({ request, env }) => {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').trim();
    if (!email) {
      return json({ ok: true, message: 'Use POST with JSON { email } or GET ?email=...' });
    }
    if (!env?.TELEGRAM_TOKEN || !env?.TELEGRAM_CHAT_ID) {
      return json({ error: 'Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID' }, { status: 500 });
    }
    const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`;
    const body = JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `New submission: ${email}` });
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    // Return no content for beacon-style GETs
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (_) {
    return json({ error: 'Unexpected error' }, { status: 500 });
  }
};

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env || !env.TELEGRAM_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ error: 'Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID' }, { status: 500 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return json({ error: 'Expected application/json' }, { status: 400 });
    }

    const payload = await request.json().catch(() => ({}));
    const email = (payload && typeof payload.email === 'string') ? payload.email.trim() : '';
    if (!email) {
      return json({ error: 'Missing email' }, { status: 400 });
    }

    const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`;
    const body = JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `New submission: ${email}` });

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const data = await resp.json();
    return json(data, { status: resp.status });
  } catch (err) {
    return json({ error: 'Unexpected error' }, { status: 500 });
  }
};


