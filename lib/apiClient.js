/**
 * ╔══════════════════════════════════════╗
 * ║    KEVOO BOT – API CLIENT           ║
 * ╚══════════════════════════════════════╝
 * Centralized API calls with fallback
 */

import axios from 'axios';
import config from '../config.js';
import logger from './logger.js';

const axiosClient = axios.create({
  timeout: 30000,
  headers: { 'User-Agent': 'KevooBot/2.0' },
});

// ─── AI Chat ───────────────────────────────────────────

/**
 * Chat with AI via Groq → OpenRouter fallback
 */
export async function chatAI(userMessage) {
  const systemPrompt =
    'You are KevooBot, a helpful, friendly WhatsApp assistant. Keep replies concise and useful. Use emojis sparingly.';

  // Attempt 1: Groq (Free & Fast)
  if (config.groqApiKey && config.groqApiKey !== 'your_groq_api_key_here') {
    try {
      const res = await axiosClient.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
      
      const reply = res.data?.choices?.[0]?.message?.content;
      if (reply) {
        logger.info('✅ AI response from Groq');
        return reply.trim();
      }
    } catch (err) {
      logger.warn('⚠️ Groq API error:', err.response?.status || err.message);
      logger.warn('Trying fallback...');
    }
  }

  // Attempt 2: OpenRouter (Free models available)
  if (config.openRouterApiKey && config.openRouterApiKey !== 'your_openrouter_api_key_here') {
    try {
      const res = await axiosClient.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3-8b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${config.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/kelgralich1122/Whatsapp-bot',
          },
          timeout: 15000,
        }
      );
      
      const reply = res.data?.choices?.[0]?.message?.content;
      if (reply) {
        logger.info('✅ AI response from OpenRouter');
        return reply.trim();
      }
    } catch (err) {
      logger.warn('⚠️ OpenRouter API error:', err.response?.status || err.message);
    }
  }

  return '🤖 AI is currently unavailable. Make sure GROQ_API_KEY or OPENROUTER_API_KEY is set in .env';
}

// ─── TikTok Download ──────────────────────────────────

/**
 * Download TikTok video via TiklyDown API
 */
export async function downloadTikTok(url) {
  // Attempt 1: TiklyDown
  try {
    const res = await axiosClient.get(
      `${config.apis.tiklydown}/api/download`,
      { params: { url }, timeout: 15000 }
    );
    const data = res.data;
    if (data?.video?.noWatermark) {
      return {
        videoUrl: data.video.noWatermark,
        audioUrl: data.music?.play_url || null,
        title: data.title || 'TikTok Video',
        author: data.author?.nickname || 'Unknown',
      };
    }
  } catch (err) {
    logger.warn('TiklyDown failed:', err.message);
  }

  // Attempt 2: Cobalt API
  try {
    const res = await axiosClient.post(
      `${config.apis.cobalt}/`,
      { url, downloadMode: 'auto' },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    if (res.data?.url) {
      return {
        videoUrl: res.data.url,
        audioUrl: null,
        title: 'TikTok Video',
        author: 'Unknown',
      };
    }
  } catch (err) {
    logger.warn('Cobalt TikTok fallback failed:', err.message);
  }

  return null;
}

// ─── YouTube Download ─────────────────────────────────

/**
 * Download YouTube audio/video via Cobalt
 */
export async function downloadYouTube(url, mode = 'audio') {
  try {
    const payload = {
      url,
      downloadMode: mode === 'audio' ? 'audio' : 'auto',
      audioFormat: 'mp3',
    };
    const res = await axiosClient.post(
      `${config.apis.cobalt}/`,
      payload,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    if (res.data?.url) {
      return { url: res.data.url, filename: res.data.filename || `yt_${mode}` };
    }
  } catch (err) {
    logger.warn('Cobalt YT failed:', err.message);
  }

  return null;
}

// ─── Instagram Download ───────────────────────────────

/**
 * Download Instagram reel/post via Cobalt
 */
export async function downloadInstagram(url) {
  try {
    const res = await axiosClient.post(
      `${config.apis.cobalt}/`,
      { url, downloadMode: 'auto' },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    if (res.data?.url) {
      return { url: res.data.url, filename: res.data.filename || 'ig_media' };
    }
  } catch (err) {
    logger.warn('Cobalt IG failed:', err.message);
  }

  return null;
}

// ─── Weather ──────────────────────────────────────────

/**
 * Get weather using Open-Meteo (free, no API key)
 */
export async function getWeather(lat, lon) {
  try {
    const res = await axiosClient.get(config.apis.openMeteo, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        timezone: 'auto',
      },
      timeout: 10000,
    });
    return res.data?.current_weather || null;
  } catch (err) {
    logger.warn('Weather API failed:', err.message);
    return null;
  }
}

// ─── DuckDuckGo Search ───────────────────────────────

/**
 * Search via DuckDuckGo instant answer API
 */
export async function duckSearch(query) {
  try {
    const res = await axiosClient.get('https://api.duckduckgo.com/', {
      params: { q: query, format: 'json', no_redirect: 1, no_html: 1, skip_disambig: 1 },
      timeout: 10000,
    });
    const d = res.data;
    if (d?.AbstractText) {
      return {
        answer: d.AbstractText,
        source: d.AbstractSource || '',
        url: d.AbstractURL || '',
      };
    }
    if (d?.RelatedTopics?.[0]?.Text) {
      return {
        answer: d.RelatedTopics[0].Text,
        source: 'DuckDuckGo',
        url: d.RelatedTopics[0].FirstURL || '',
      };
    }
  } catch (err) {
    logger.warn('DuckDuckGo failed:', err.message);
  }
  return null;
}

export default {
  chatAI,
  downloadTikTok,
  downloadYouTube,
  downloadInstagram,
  getWeather,
  duckSearch,
};
