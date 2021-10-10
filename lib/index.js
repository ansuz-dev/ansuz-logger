import fs from "fs";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import expressWinston from "express-winston";

const __dirname = path.resolve();

const logDirectory = path.join(__dirname, "logs");
const debugDirectory = path.join(logDirectory, "debug");
const requestDirectory = path.join(logDirectory, "request");
const errorDirectory = path.join(logDirectory, "error");

fs.existsSync(debugDirectory)
  || fs.mkdirSync(debugDirectory, {recursive: true});
fs.existsSync(requestDirectory)
  || fs.mkdirSync(requestDirectory, {recursive: true});
fs.existsSync(errorDirectory)
  || fs.mkdirSync(errorDirectory, {recursive: true});

expressWinston.bodyBlacklist.push("password");


const requestLogFormat = winston.format.printf(info => {
  let message = `${info.timestamp} - ${info.level.toUpperCase()} : ${info.message}`;
  if (info.req && info.req.body && Object.keys(info.req.body).length) {
    message += " " + JSON.stringify({req: info.req})
  }
  if (info.stack) {
    message += "\n  " + info.stack.replace(/\n\s*at.*\/node_modules\/.*/gmu, "");
  }

  return message;
});

const debugLogFormat = winston.format.printf(info => {
  let message = `${info.timestamp} - [${info.level.toUpperCase()}] : ${info.message}`;
  if (info.stack) {
    message += "\n  " + info.stack.replace(/\n\s*at.*\/node_modules\/.*/gmu, "");
  }

  return message;
});

export const debugLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    debugLogFormat,
  ),
  transports: [
    new DailyRotateFile({
      dirname: debugDirectory,
      filename: "debug-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "15d",
      json: false,
      level: "debug",
    }),
  ],
  exitOnError: false,
});

export const requestLogger = expressWinston.logger({
  transports: [
    new DailyRotateFile({
      dirname: requestDirectory,
      filename: "request-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "15d",
      json: false,
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    requestLogFormat,
  ),
  msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  metaField: null,
  requestWhitelist: ["body"],
  bodyBlacklist: ["password"],
  responseWhitelist: [],
  colorize: false,
  ignoreRoute: function (req) {
    if (req.url.match(/^\/docs\/.*/g)) {
      return true;
    }

    return false;
  },
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    new DailyRotateFile({
      dirname: errorDirectory,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "15d",
      json: false,
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    requestLogFormat,
  ),
  msg: "{{req.method}} {{req.url}}",
  metaField: null,
  blacklistedMetaFields: ["exception", "process", "os"],
  requestWhitelist: ["body"],
  responseWhitelist: [],
  colorize: false,
});

export default debugLogger;
