/* eslint-disable no-fallthrough */
import utils from "./utils";

const LogLevel = {
  DEBUG: "debug",
  LOG: "log",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
};

class ConsoleLogger {
  constructor(private tag?: string) {
    // Store the tag name
    this.tag = tag ?? "";

    // Get the `lsloglevel` value from the URL query parameter
    const logLevel = utils.getQueryParam("lsloglevel", LogLevel.WARN); // Default to disabled

    // Define log functions
    const logFuncs = {
      DEBUG: (...args: any) => console.debug(`[${this.tag}]`, ...args),
      LOG: (...args: any) => console.log(`[${this.tag}]`, ...args),
      INFO: (...args: any) => console.info(`[${this.tag}]`, ...args),
      WARN: (...args: any) => console.warn(`[${this.tag}]`, ...args),
      ERROR: (...args: any) => console.error(`[${this.tag}]`, ...args),
      TABLE: (...args: any) => console.table(...args),
    };

    switch (logLevel) {
      case LogLevel.DEBUG:
        this.debug = logFuncs.DEBUG;
        this.table = logFuncs.TABLE;
      case LogLevel.LOG:
      case LogLevel.INFO:
        this.log = logFuncs.LOG;
        this.info = logFuncs.INFO;
      case LogLevel.WARN:
        this.warn = logFuncs.WARN;
      case LogLevel.ERROR:
        this.error = logFuncs.ERROR;
    }
  }

  public debug(...args: any) {}
  public table(...args: any) {}
  public log(...args: any) {}
  public warn(...args: any) {}
  public info(...args: any) {}
  public error(...args: any) {}
}

export default ConsoleLogger;
