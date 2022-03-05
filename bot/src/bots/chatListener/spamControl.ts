import { getTimeNow } from "../../helper/time";
import {
  SPAM_MAX_MSG,
  SPAM_CHECK_SECONDS,
  SPAM_TIMEOUT_SECONDS,
} from "./config";

type SpamControlItem = {
  username: string;
  counter: number;
  lastMessageTime: number;
  lastMessageText?: string;
  warning: boolean;
};

const spamControl: Array<SpamControlItem> = [];

setInterval(() => {
  spamControl.map((s) => {
    const elapsedTime = getTimeNow() - s.lastMessageTime;
    const shouldResetSpam = elapsedTime > SPAM_TIMEOUT_SECONDS && s.counter > 0;
    if (shouldResetSpam) {
      console.log(`[SPAM] ${s.username} resetado`);
      s.counter = 0;
      s.warning = false;
    }

    return s;
  });
}, SPAM_CHECK_SECONDS * 1000);

export const getSpamState = ({
  username,
  message,
}: {
  username: string;
  message: string;
}) => {
  const spamItem = spamControl.find((s) => s.username === username);
  if (spamItem) {
    const isCounterHigh = spamItem.counter >= SPAM_MAX_MSG;
    const isLastMessageEqual = spamItem.lastMessageText === message;

    if (isCounterHigh && isLastMessageEqual && !spamItem.warning) {
      spamItem.warning = true;
      return "WARNING";
    } else if (isCounterHigh && isLastMessageEqual && spamItem.warning) {
      return "SPAM";
    } else {
      return "OK";
    }
  }
  return "OK";
};

export const addSpam = (username: string, message: string) => {
  const spamItem = spamControl.find((s) => s.username === username);

  if (spamItem) {
    spamItem.counter = spamItem.counter + 1;
    spamItem.lastMessageTime = getTimeNow();
    spamItem.lastMessageText = message;
  } else {
    spamControl.push({
      username,
      counter: 0,
      lastMessageTime: getTimeNow(),
      lastMessageText: undefined,
      warning: false,
    });
  }
};
