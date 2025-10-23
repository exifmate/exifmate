import { debug, error, info, trace, warn } from '@tauri-apps/plugin-log';

function forwardConsole(
  fnName: 'debug' | 'error' | 'info' | 'log' | 'warn',
  logger: (message: string) => Promise<void>,
) {
  const original = console[fnName];
  console[fnName] = (...message) => {
    original(...message);
    logger(JSON.stringify(message));
  };
}

export function forwardLogging() {
  forwardConsole('debug', debug);
  forwardConsole('error', error);
  forwardConsole('info', info);
  forwardConsole('log', trace);
  forwardConsole('warn', warn);
}
