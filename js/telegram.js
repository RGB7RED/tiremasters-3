const TELEGRAM_BOT_TOKEN = '8130437470:AAFRvjDjsNPS2qNXHsBllcVQ4tbW54O7yK8';
// TODO: подставьте реальный chat_id вашего диалога с ботом
export const TIREMASTERS_CHAT_ID = '<chat_id_placeholder>';

export async function sendTelegramLead(chatId, message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Telegram API error: ${response.status} ${errorText}`);
  }

  return response.json().catch(() => null);
}
