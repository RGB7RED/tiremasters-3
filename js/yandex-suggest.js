// Инициализация подсказок адресов Яндекс.Карт
ymaps.ready(initAddressSuggest);

function initAddressSuggest() {
  const addressInput =
    document.querySelector('input[name="location"]') ||
    document.querySelector('input[placeholder*="Адрес"]') ||
    document.querySelector('input[placeholder*="локация"]');

  if (!addressInput) {
    console.warn('Поле адреса для подсказок не найдено');
    return;
  }

  const suggestView = new ymaps.SuggestView(addressInput, {
    provider: {
      suggest(request) {
        return ymaps.suggest(request, {
          boundedBy: [
            [59, 29],
            [61, 32]
          ],
          strictBounds: true
        });
      }
    }
  });

  suggestView.events.add('select', (event) => {
    const value = event.get('item').value;

    ymaps.geocode(value).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (!firstGeoObject) return;

      const coords = firstGeoObject.geometry.getCoordinates();
      const coordsInput = document.querySelector('input[name="coords"]');

      if (coordsInput && coords) {
        coordsInput.value = coords.join(',');
      }
    });
  });
}
