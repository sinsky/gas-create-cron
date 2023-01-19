declare const global: {
  [x: string]: any;
};

import parseDate, { type OptionProps } from "./parseDate";
/**
 * cronのテキストから、Date型を生成する
 * @param {string} cronText - cron型のテキスト
 * @param {object} options - options
 * @returns {Date[]} cronで生成されたDateリスト
 */
global.parseDate = (cronText: string, options?: OptionProps) => parseDate(cronText, options);
