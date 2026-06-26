const express = require('express');
const cors = require('cors');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const PORT = process.env['PORT'] || 3001;
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] || '';

app.use(
  cors({
    origin: FRONTEND_ORIGIN || true,
  })
);
app.use(express.json());

function formatTranscript(items) {
  const parts = [];
  let last = '';

  for (const item of items) {
    const text = String(item.text ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text || text === last) {
      continue;
    }
    parts.push(text);
    last = text;
  }

  return parts.join(' ');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/transcript', async (req, res) => {
  const videoId = String(req.query.videoId ?? '').trim();

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    res.status(400).json({ error: 'A valid 11-character videoId is required.' });
    return;
  }

  const lang = String(req.query.lang ?? '').trim() || undefined;

  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId, lang ? { lang } : undefined);

    if (!items?.length) {
      res.status(404).json({
        error: 'No captions found for this video. Try another language or paste the transcript manually.',
      });
      return;
    }

    const text = formatTranscript(items);
    if (!text || text.length < 10) {
      res.status(404).json({ error: 'Transcript was empty. Paste the script manually.' });
      return;
    }

    res.json({
      videoId,
      text,
      segmentCount: items.length,
      language: lang ?? 'auto',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transcript';
    res.status(404).json({
      error:
        message.includes('disabled') || message.includes('Transcript')
          ? 'Captions are disabled or unavailable for this video.'
          : 'Could not load transcript. Check the URL or paste captions manually.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`TypeFlow transcript API listening on http://localhost:${PORT}`);
});
