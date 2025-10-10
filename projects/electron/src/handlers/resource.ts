import { app } from "electron";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { lookup } from 'mime-types';
import { join, resolve } from "path";

export async function getResourceUrl(fileName: string) {
  const filePath = app.isPackaged ? join(app.getPath('assets'), 'resources', 'assets', fileName) : resolve(join(__dirname, '..', 'assets', fileName));
  if (!existsSync(filePath)) {
    return null;
  }
  const base64 = await readFile(filePath, 'base64');
  const mimeType = lookup(filePath);
  if (!mimeType) return null;

  return `data:${mimeType};base64,${base64}`;
}
