import { createLogger, transports, format } from "winston";
import { addColors } from "winston/lib/winston/config";

const colors = {
  info: "blue",
  warn: "yellow",
  error: "red",
  http: "cyan",
  debug: "gray",
};

addColors(colors);

const uppercaseFormat = format((info) => {
  info.originalLevel = info.level;
  info.level = info.level.toUpperCase();
  return info;
});

const customFormat = format.printf(({ timestamp, level, message }) => {
  const timeOnly = timestamp
    ? String(timestamp).split(" ")[1]
    : new Date().toISOString();
  return `${timeOnly} [${level}]: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        uppercaseFormat(),
        format.colorize(),
        customFormat,
      ),
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
