import ConsoleLogger from "./ConsoleLogger"
import utils from "./utils"

declare global {
    interface Window { 
        AndroidNativeHandler: any
        webkit: any
    }
}

const logger = new ConsoleLogger("NativeBridge")


// AndroidNativeHandler is a interface which contains all the functionality pass by Android code
export const AndroidNativeHandler = window.AndroidNativeHandler

// IOSNativeHandler is a interface which contains all the functionality pass by IOS native
export const IOSNativeHandler = window.webkit?.messageHandlers

/** This method calls the native android function if present */
const callNativeAndroidFunction = (func: string, message?: any) => {
  // Return false if function is not present
  if (!AndroidNativeHandler?.[func]) return false

  // Check if the message is an object and stringify it
  const stringifiedMessage =
    typeof message === "object" ? JSON.stringify(message) : message

  try {
    // Call the corresponding function with the message parameter
    stringifiedMessage
      ? AndroidNativeHandler[func](stringifiedMessage)
      : AndroidNativeHandler[func]()
  } catch (err) {
    logger.error("Error while calling android native function", err)
    return false
  }

  return true
}

/** This method calls the native iOS function if present */
const callNativeIOSFunction = (func: string, message?: any) => {
  logger.log(`Calling IOSNativeHandler.[${func}].`)
  if (!IOSNativeHandler?.[func]) {
    logger.log(`IOSNativeHandler.[${func}] does not exist.`)
    return false
  }

  try {
    // Check if the message is an object and stringify it
    const stringifiedMessage =
      typeof message === "object" ? JSON.stringify(message) : message

    // Call the corresponding function with the message parameter
    IOSNativeHandler[func].postMessage(stringifiedMessage)
    logger.log(`IOSNativeHandler.[${func}] posted.`)
  } catch (err) {
    logger.error("Error while calling iOS native function", err)
    return false
  }
  return true
}

const fallbackHandler = () => {
  return false
}

const enableNativeEvents = utils.getQueryParam("enableNativeEvents", "false") === "true";

export const callNativeAppFunction = enableNativeEvents
  ? fallbackHandler
  : AndroidNativeHandler
  ? callNativeAndroidFunction
  : IOSNativeHandler
  ? callNativeIOSFunction
  : fallbackHandler;


class NativeBridge {
  // Create a private static property to hold the singleton instance
  static INSTANCE = new NativeBridge()

  constructor() {
    return NativeBridge.INSTANCE
  }

  /**
   * A public static method is defined to get the singleton instance.
   */
  static getInstance() {
    return NativeBridge.INSTANCE
  }

  /**
   * This method will be called from the native app for redrawing the layout
   */
  redraw() {
    logger.log("NativeBridge:: redraw()")
    // Pass the event to react code to handle 
  }

  eventAvatarLoaded() {
    return callNativeAppFunction("eventAvatarLoaded")
  }

}

const nativeBridge = NativeBridge.getInstance()

export default nativeBridge;
