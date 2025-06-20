import winston from 'winston';
import chalk from 'chalk';

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} `;
  
  switch (level) {
    case 'error':
      msg += chalk.red(`[ERROR] ${message}`);
      break;
    case 'warn':
      msg += chalk.yellow(`[WARN] ${message}`);
      break;
    case 'info':
      msg += chalk.blue(`[INFO] ${message}`);
      break;
    case 'debug':
      msg += chalk.gray(`[DEBUG] ${message}`);
      break;
    default:
      msg += `[${level.toUpperCase()}] ${message}`;
  }
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'devforge.log',
      level: 'debug',
      format: winston.format.uncolorize()
    })
  ],
});
