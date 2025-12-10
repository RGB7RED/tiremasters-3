const TM_TELEGRAM_BOT_TOKEN = '8130437470:AAFRvjDjsNPS2qNXHsBllcVQ4tbW54O7yK8';
const TM_TELEGRAM_CHAT_IDS = [6010246421, 5911021141];

async function sendTelegramLead({ service, name, phone, address, comment }) {
  if (!TM_TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }
  const chatIds = Array.from(new Set(TM_TELEGRAM_CHAT_IDS.filter(Boolean)));
  if (!chatIds.length) {
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
  try {
    const results = await Promise.all(
      chatIds.map(async (chatId) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          console.error('Telegram API error', {
            httpStatus: response.status,
            telegramResponse: data,
          });
          throw new Error(data.description || 'Telegram API error');
        }

        return data;
      })
    );

    console.log('Telegram lead sent successfully', results);
    return true;
  } catch (error) {
    console.error('Telegram send error', error);
    throw error;
  }
}

window.TM_sendTelegramLead = sendTelegramLead;
