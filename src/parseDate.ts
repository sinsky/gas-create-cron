import { parseExpression, type ParserOptions, type CronExpression } from "cron-parser";

type defaultOptionProps = ParserOptions & {
  limit?: number;
};

type SomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type OptionProps = SomeRequired<defaultOptionProps, "limit"> | SomeRequired<defaultOptionProps, "endDate">;

const parseDate = (cronText: string, option?: OptionProps) => {
  const cron = parseExpression(cronText, { ...option, tz: option?.tz ?? "Asia/Tokyo" });
  if (option?.limit) {
    return convertLimitToDateList(cron, option.limit);
  } else if (option?.endDate) {
    return convertEndDateToDateList(cron);
  } else {
    console.warn("optionでlimitの指定がなかったため、5つに制限されます");
    return convertLimitToDateList(cron, 5);
  }
};

export default parseDate;

/**
 * Cronオブジェクトから、日付を取り出し、リストに格納して返却する
 * @param {CronExpression} cron - cronオブジェクト
 * @returns {Date[]} cronで生成された日付リスト(※最大20)
 */
export const convertEndDateToDateList = (cron: CronExpression) => {
  const dateList: Date[] = [];
  while (cron.hasNext() && dateList.length < 20) {
    const date = cron.next().toDate();
    dateList.push(date);
  }
  if (dateList.length >= 20) console.warn("一回で返す値は20個までに制限されています\n20を超える場合は、optionにlimitを指定してください");
  return dateList;
};

/**
 * cronオブジェクトから日付を取り出し、リストに格納して返却する
 * @param {CronExpression} cron
 * @param {number} maxLimit - 返却するDateオブジェクトの最大個数
 * @returns {Date[]} cronで生成された日付リスト
 */
export const convertLimitToDateList = (cron: CronExpression, maxLimit: number) =>
  Array.from(Array(maxLimit))
    .map(() => (cron.hasNext() ? cron.next() : undefined))
    .filter((value): value is Exclude<typeof value, undefined> => value !== undefined)
    .map((cronDate) => cronDate.toDate());
