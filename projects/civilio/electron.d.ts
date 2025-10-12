declare global {
  interface Window {
    electron: {
      send: (channel: string, data: any) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      sendSync: (channel: string, data: any) => any;
      removeListener: (channel: string, func: (...args: any[]) => void) => void;
      off: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

export { };

