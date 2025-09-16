import { AppErrorSchema, Channel, computeReplyChannel, RpcBaseSchema, RpcInputHeaders, rpcMessageSchema, TimeoutError } from "@civilio/shared";

function generateMessageId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWQYZ0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export async function sendRpcAndWaitAsync(channel: Channel, timeout: number = 30000, data?: unknown) {
  const id = generateMessageId();
  const replyChannel = computeReplyChannel(channel);
  return new Promise((resolve, reject) => {
    const cleanup = (closeTimer = true) => {
      window.electron.off('error', errorHandler);
      window.electron.off(replyChannel, replyHandler);
      if (closeTimer)
        clearTimeout(timer);
    }
    const errorHandler = (_: any, arg: any) => {
      const err = rpcMessageSchema(AppErrorSchema).parse(arg);
      if (err.headers.messageId === id && err.headers.srcChannel === channel) {
        reject(err);
        cleanup();
      }
    };
    const replyHandler = (_: any, arg: any) => {
      const rpc = RpcBaseSchema.parse(arg);
      if (id === rpc.headers.messageId && rpc.headers.srcChannel === channel) {
        resolve(arg);
        cleanup();
      }
    }
    window.electron.on('error', errorHandler);
    window.electron.on(replyChannel, replyHandler);
    window.electron.send(channel, {
      headers: {
        srcChannel: channel,
        messageId: id,
        ts: Date.now(),
        timeout
      } as RpcInputHeaders,
      body: data ?? undefined
    });
    const timer = setTimeout(() => {
      reject(new TimeoutError(timeout, channel, id));
      cleanup(false);
    }, timeout)
  })
}
