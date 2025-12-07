function setupLeadForm(formSelector, serviceLabel) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const nameInput = form.querySelector('[name="name"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const addressInput = form.querySelector('[name="address"]');
  const commentInput = form.querySelector('[name="comment"]');
  const submitButton = form.querySelector('[type="submit"]');
  const statusBox = form.querySelector('[data-form-status]');

  function setStatus(type, message) {
    if (!statusBox) return;
    statusBox.textContent = message || '';
    statusBox.dataset.statusType = type || '';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    setStatus('', '');
    if (!submitButton) return;

    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем…';

    const name = nameInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const address = addressInput?.value.trim();
    const comment = commentInput?.value.trim();

    const digits = (phone || '').replace(/\D/g, '');
    if (digits.length < 5) {
      setStatus('error', 'Введите корректный номер телефона');
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
      return;
    }

    try {
      await window.TM_sendTelegramLead({
        service: serviceLabel,
        name,
        phone,
        address,
        comment,
      });

      form.reset();
      setStatus('success', 'Заявка отправлена. Мы перезвоним вам в ближайшее время.');
    } catch (error) {
      console.error('Lead submission error', error);
      setStatus(
        'error',
        'Не удалось отправить заявку. Попробуйте ещё раз или позвоните по телефону.'
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
}

function initLeadForms() {
  setupLeadForm('#evacuator-form', 'Эвакуатор');
  setupLeadForm('#avtoelektrik-form', 'Автоэлектрик');
}

document.addEventListener('DOMContentLoaded', initLeadForms);
