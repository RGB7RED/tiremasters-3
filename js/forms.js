import { sendTelegramLead, TIREMASTERS_CHAT_ID } from './telegram.js';

function formatLeadMessage({
  serviceTitle,
  page,
  name,
  phone,
  addressLabel,
  address,
  commentLabel,
  comment,
}) {
  const now = new Date().toLocaleString('ru-RU');

  return [
    `Новая заявка: ${serviceTitle}`,
    '',
    `Страница: ${page}`,
    `Имя: ${name || '—'}`,
    `Телефон: ${phone}`,
    `${addressLabel}: ${address || '—'}`,
    `${commentLabel}: ${comment || '—'}`,
    '',
    'Источник: сайт TireMasters',
    `Время: ${now}`,
  ].join('\n');
}

function setupEvacuatorForm() {
  const form = document.getElementById('evacuator-form');
  if (!form) return;

  const statusEl = document.getElementById('evacuator-form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!submitBtn || !statusEl) return;

    statusEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем...';

    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const address = formData.get('address')?.toString().trim() || '';
    const comment = formData.get('comment')?.toString().trim() || '';

    if (!phone) {
      statusEl.textContent = 'Укажите, пожалуйста, телефон.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
      return;
    }

    const message = formatLeadMessage({
      serviceTitle: 'ЭВАКУАТОР',
      page: 'evacuator.html',
      name,
      phone,
      addressLabel: 'Адрес / локация',
      address,
      commentLabel: 'Комментарий',
      comment,
    });

    try {
      await sendTelegramLead(TIREMASTERS_CHAT_ID, message);
      statusEl.textContent = 'Заявка отправлена. Мы перезвоним в ближайшее время.';
      form.reset();
    } catch (error) {
      console.error(error);
      statusEl.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните по телефону.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
  });
}

function setupAvtoelektrikForm() {
  const form = document.getElementById('avtoelektrik-form');
  if (!form) return;

  const statusEl = document.getElementById('avtoelektrik-form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!submitBtn || !statusEl) return;

    statusEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем...';

    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const address = formData.get('address')?.toString().trim() || '';
    const issue = formData.get('issue')?.toString().trim() || '';

    if (!phone) {
      statusEl.textContent = 'Укажите, пожалуйста, телефон.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Вызвать автоэлектрика';
      return;
    }

    const message = formatLeadMessage({
      serviceTitle: 'АВТОЭЛЕКТРИК',
      page: 'avtoelektrik.html',
      name,
      phone,
      addressLabel: 'Адрес или ориентир',
      address,
      commentLabel: 'Что произошло',
      comment: issue,
    });

    try {
      await sendTelegramLead(TIREMASTERS_CHAT_ID, message);
      statusEl.textContent = 'Заявка отправлена. Мы перезвоним в ближайшее время.';
      form.reset();
    } catch (error) {
      console.error(error);
      statusEl.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните по телефону.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Вызвать автоэлектрика';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupEvacuatorForm();
  setupAvtoelektrikForm();
});

export { setupEvacuatorForm, setupAvtoelektrikForm };
