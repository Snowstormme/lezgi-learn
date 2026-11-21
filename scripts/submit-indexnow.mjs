import { readFileSync } from 'node:fs';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lezgi-learn.notsnowstorm.workers.dev'
).replace(/\/+$/, '');
const HOST = new URL(SITE_URL).host;
const KEY = '9c4e7f2a8b1d4e6093a5c7d2f1e8b406';

const URL_LIST = [
  `${SITE_URL}/`,
  `${SITE_URL}/learn`,
  `${SITE_URL}/dictionary`,
  `${SITE_URL}/translate`,
  `${SITE_URL}/lesson/u1-l1-greetings`,
  `${SITE_URL}/review`,
];

async function submitIndexNow() {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList: URL_LIST,
  };

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  console.log(`IndexNow response: HTTP ${response.status}`);
  if (!response.ok && response.status !== 202) {
    const body = await response.text();
    console.error(body);
    process.exitCode = 1;
  }
}

submitIndexNow();
