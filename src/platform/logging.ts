import { debug, error, info, trace, warn } from '@tauri-apps/plugin-log';

function forwardConsole(
  fnName: 'debug' | 'error' | 'info' | 'log' | 'warn',
  logger: (message: string) => Promise<void>,
) {
  const original = console[fnName];
  console[fnName] = (...message) => {
    original(...message);
    try {
      logger(JSON.stringify(message)).catch((err) => {
        console.error('Failed to log to Tauri:', err);
      });
    } catch (err) {
      console.error('Failed to serialize JSON:', err);
    }
  };
}

export function forwardLogging() {
  forwardConsole('debug', debug);
  forwardConsole('error', error);
  forwardConsole('info', info);
  forwardConsole('log', trace);
  forwardConsole('warn', warn);
}
