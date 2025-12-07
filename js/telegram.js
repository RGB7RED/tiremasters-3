const TM_TELEGRAM_BOT_TOKEN = '8130437470:AAFRvjDjsNPS2qNXHsBllcVQ4tbW54O7yK8';
const TM_TELEGRAM_CHAT_ID = 6010246421;

async function sendTelegramLead({ service, name, phone, address, comment }) {
  if (!TM_TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }
  if (!TM_TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID is not configured');
  }

  const textLines = [
    `Новая заявка (${service})`,
    '',
    `Имя: ${name || '—'}`,
    `Телефон: ${phone || '—'}`,
    `Адрес / ориентир: ${address || '—'}`,
    `Комментарий: ${comment || '—'}`,
  ];
  const text = textLines.join('\n');

  const url = `https://api.telegram.org/bot${TM_TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TM_TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error', {
        httpStatus: response.status,
        telegramResponse: data,
      });
      throw new Error(data.description || 'Telegram API error');
    }

    console.log('Telegram lead sent successfully', data);
    return true;
  } catch (error) {
    console.error('Telegram send error', error);
    throw error;
  }
}

window.TM_sendTelegramLead = sendTelegramLead;
