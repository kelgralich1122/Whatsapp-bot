/**
 * Command: weather
 * Get weather information (using Open-Meteo, free)
 */

import axios from 'axios';
import { getWeather } from '../lib/apiClient.js';
import logger from '../lib/logger.js';

// Simple geocoding via Open-Meteo geocoding API (free, no key)
async function geocode(query) {
  try {
    const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: query, count: 1, language: 'en', format: 'json' },
      timeout: 10000,
    });
    const loc = res.data?.results?.[0];
    if (loc) {
      return { lat: loc.latitude, lon: loc.longitude, name: loc.name, country: loc.country || '' };
    }
  } catch (err) {
    logger.warn('Geocoding failed:', err.message);
  }
  return null;
}

const WMO_CODES = {
  0: '☀️ Clear sky',
  1: '🌤️ Mainly clear',
  2: '⛅ Partly cloudy',
  3: '☁️ Overcast',
  45: '🌫️ Fog',
  48: '🌫️ Rime fog',
  51: '🌦️ Light drizzle',
  53: '🌧️ Moderate drizzle',
  55: '🌧️ Dense drizzle',
  61: '🌧️ Slight rain',
  63: '🌧️ Moderate rain',
  65: '🌧️ Heavy rain',
  71: '🌨️ Slight snow',
  73: '🌨️ Moderate snow',
  75: '🌨️ Heavy snow',
  80: '🌦️ Slight showers',
  81: '🌧️ Moderate showers',
  82: '🌧️ Violent showers',
  95: '⛈️ Thunderstorm',
  96: '⛈️ Thunderstorm with hail',
  99: '⛈️ Thunderstorm with heavy hail',
};

export default {
  name: 'weather',
  aliases: ['w', 'forecast'],
  category: 'Tools',
  description: 'Get weather for a location',
  usage: '.weather <city name>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs) {
      await sock.sendMessage(jid, {
        text: '❓ Which city?\n\n*Usage:* .weather Nairobi',
      }, { quoted: msg });
      return;
    }

    const loc = await geocode(fullArgs.trim());
    if (!loc) {
      await sock.sendMessage(jid, {
        text: '❌ Location not found. Try a different city name.',
      }, { quoted: msg });
      return;
    }

    const weather = await getWeather(loc.lat, loc.lon);
    if (!weather) {
      await sock.sendMessage(jid, {
        text: '❌ Could not fetch weather data. Please try again later.',
      }, { quoted: msg });
      return;
    }

    const condition = WMO_CODES[weather.weathercode] || '🌡️ Unknown';
    const windDir = weather.winddirection || 0;

    await sock.sendMessage(jid, {
      text:
        `🌍 *Weather: ${loc.name}, ${loc.country}*\n\n` +
        `${condition}\n` +
        `🌡️ Temperature: ${weather.temperature}°C\n` +
        `💨 Wind: ${weather.windspeed} km/h (${windDir}°)\n` +
        `🕐 Time: ${weather.time || 'N/A'}\n\n` +
        `_Powered by Open-Meteo_ ⚡`,
    }, { quoted: msg });
  },
};
