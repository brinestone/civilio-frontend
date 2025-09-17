import { Channel, RpcInputHeaders } from "@civilio/shared";

export function logRequest(channel: Channel, data: { headers: RpcInputHeaders }) {
  console.log(`<-- ${data.headers.ts} [${channel}]::${data.headers.messageId}`);
}

export function logResponse(channel: Channel | 'error', data: { headers: RpcInputHeaders }) {
  console.log(`--> ${data.headers.ts} [${channel}]::${data.headers.messageId}`);
}
