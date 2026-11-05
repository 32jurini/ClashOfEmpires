const geoUrl = 'https://geocoding-api.open-meteo.com/v1/search';
const weatherUrl = 'https://api.open-meteo.com/v1/forecast';

const weatherCodes = {
  0: ['Clear skies', '☀️'],
  1: ['Mostly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Cloudy', '☁️'],
  45: ['Foggy', '🌫️'],
  48: ['Foggy', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌦️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '❄️'],
  75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '❄️'],
  80: ['Rain showers', '🌦️'],
  81: ['Rain showers', '🌧️'],
  82: ['Heavy showers', '⛈️'],
  85: ['Snow showers', '🌨️'],
  86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm', '⛈️'],
  99: ['Thunderstorm', '⛈️']
};

export async function loadLocalWeather(query) {
  const cityElement = document.querySelector('#kingdom-location');
  const label = document.querySelector('#weather-label');
  const temperature = document.querySelector('#weather-temp');
  const icon = document.querySelector('#weather-icon');

  cityElement.textContent = query;
  label.textContent = 'Checking local weather…';

  try {
    const locationResponse = await fetch(
      `${geoUrl}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    );

    if (!locationResponse.ok) {
      throw new Error('Could not search for that location.');
    }

    const locationData = await locationResponse.json();
    const place = locationData.results?.[0];

    if (!place) {
      throw new Error('Location not found.');
    }

    cityElement.textContent =
      `${place.name}${place.admin1 ? `, ${place.admin1}` : ''}`;

    const weatherResponse = await fetch(
      `${weatherUrl}?latitude=${place.latitude}` +
      `&longitude=${place.longitude}` +
      '&current=temperature_2m,weather_code' +
      '&temperature_unit=fahrenheit&timezone=auto'
    );

    if (!weatherResponse.ok) {
      throw new Error('Could not get the weather.');
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    const [description, emoji] =
      weatherCodes[current.weather_code] || ['Changing skies', '☁️'];

    label.textContent = description;
    temperature.textContent = `${Math.round(current.temperature_2m)}°F`;
    icon.textContent = emoji;

    showWeather(current.weather_code);
  } catch {
    label.textContent = 'Weather unavailable';
    temperature.textContent = '--°';
    icon.textContent = '☁️';

    showWeather(-1);
  }
}

function showWeather(code) {
  const layer = document.querySelector('#weather-layer');
  layer.replaceChildren();

  if (code < 70 || code === -1) {
    return;
  }

  const isSnow = code >= 71 && code <= 86;

  for (let i = 0; i < 35; i++) {
    const particle = document.createElement('i');

    particle.className = isSnow
      ? 'weather-particle'
      : 'weather-particle weather-rain';

    if (isSnow) {
      particle.textContent = '✦';
      particle.style.fontSize = `${8 + Math.random() * 9}px`;
    }

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${3 + Math.random() * 5}s`;
    particle.style.animationDelay = `${Math.random() * -7}s`;

    layer.append(particle);
  }
}
