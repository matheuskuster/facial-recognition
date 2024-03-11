import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';

const { timestamp, label, printf } = format;

const consoleFormat = printf(({ level, message, label = process.env.NODE_ENV, timestamp }) => {
  const levelUpper = level.toUpperCase();
  switch (levelUpper) {
    case 'INFO':
      message = chalk.white(message);
      level = chalk.whiteBright.bold(level);
      break;

    case 'WARN':
      message = chalk.yellow(message);
      level = chalk.black.yellowBright.bold(level);
      break;

    case 'ERROR':
      message = chalk.red(message);
      level = chalk.black.redBright.bold(level);
      break;

    default:
      break;
  }

  return `[${chalk.black.bold.white(timestamp)}] [${chalk.blueBright.bold(label)}] [${level}]: ${message}`;
});

function getLogger() {
  const consoleTransport = new transports.Console();

  const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.combine(label(), timestamp(), format.splat(), consoleFormat)
    ),
    defaultMeta: { service: 'attendance-app' },
    transports: [consoleTransport],
  });

  return logger;
}

export default getLogger();
