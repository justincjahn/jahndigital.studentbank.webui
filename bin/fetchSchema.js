import { fileURLToPath, parse } from 'url';
import https from 'https';
import fs from 'fs';
import { dirname, resolve } from 'path';
import { config} from 'dotenv';

const basePath = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const filePath = resolve(basePath, 'src/generated/schema.graphql');

config({
  path: resolve(basePath, '.env'),
});

config({
  path: resolve(basePath, '.env.local'),
});

const file = fs.createWriteStream(filePath);

const complete = (exitCode) => {
  process.exit(exitCode);
};

const request = parse(process.env.VITE_APP_API_URL);

https.get(
  new https.Agent({
    ...request,
    rejectUnauthorized: false
  }),
  (res) => {
    console.log(res);
    res.pipe(file);
    file.on('finish', () => file.close(() => complete(0)));
  }
).on('error', (e) => {
  console.log(e);
});
