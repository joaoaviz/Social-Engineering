export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env || !env.TELEGRAM_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ error: 'Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Expected application/json' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = await request.json().catch(() => ({}));
    const email = (payload && typeof payload.email === 'string') ? payload.email.trim() : '';
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`;
    const body = JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `New submission: ${email}` });

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


