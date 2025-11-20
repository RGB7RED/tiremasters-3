export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram bot token or chat ID is missing in environment variables');
      return res.status(500).json({ ok: false, error: 'TELEGRAM credentials are not configured' });
    }

    const body = (() => {
      if (!req.body) return {};
      if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch (err) {
          console.error('Failed to parse request body JSON', err);
          return {};
        }
      }
      return req.body;
    })();
    const formatField = (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed !== '' ? trimmed : '—';
      }

      if (value === null || value === undefined) {
        return '—';
      }

      return String(value);
    };

    const name = formatField(body.name);
    const phone = formatField(body.phone);
    const message = formatField(body.message);

    if (message === '—') {
      console.error('Empty message received from form, payload:', body);
      return res.status(400).json({ ok: false, error: 'Message payload is empty' });
    }

    const text = [
      'Новая заявка с сайта TireMasters:',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Комментарий: ${message}`,
      '',
    ].join('\n');

    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!telegramResponse.ok) {
      let errorText;
      try {
        const errorJson = await telegramResponse.json();
        errorText = errorJson?.description || JSON.stringify(errorJson);
      } catch (_) {
        errorText = await telegramResponse.text();
      }
      console.error('Telegram API response error:', errorText);
      return res.status(500).json({ ok: false, error: errorText });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: error?.message || 'Internal server error' });
  }
}
