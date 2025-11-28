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
    const FALLBACK_CHAT_ID = '5911021141';

    const chatIds = [
      ...(TELEGRAM_CHAT_ID || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
      FALLBACK_CHAT_ID,
    ];

    const uniqueChatIds = Array.from(new Set(chatIds));

    if (!TELEGRAM_BOT_TOKEN || uniqueChatIds.length === 0) {
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
    const location = formatField(body.location || body.address);
    const coords = formatField(body.coords);
    const message = formatField(body.message);

    if (message === '—') {
      console.error('Empty message received from form, payload:', body);
      return res.status(400).json({ ok: false, error: 'Message payload is empty' });
    }

    const text = [
      'Новая заявка с сайта TireMasters:',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Адрес: ${location}`,
      `Координаты: ${coords}`,
      `Комментарий: ${message}`,
      '',
    ].join('\n');

    const results = await Promise.all(
      uniqueChatIds.map(async (chatId) => {
        const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
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
          console.error(`Telegram API response error for chat ${chatId}:`, errorText);
          return { chatId, ok: false, error: errorText };
        }

        return { chatId, ok: true };
      })
    );

    const failed = results.filter((r) => !r.ok);
    const succeeded = results.filter((r) => r.ok);

    if (succeeded.length === 0) {
      return res.status(500).json({ ok: false, error: failed.map((f) => `${f.chatId}: ${f.error}`).join('; ') });
    }

    return res.status(200).json({ ok: true, sent: succeeded.map((s) => s.chatId), failed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: error?.message || 'Internal server error' });
  }
}
