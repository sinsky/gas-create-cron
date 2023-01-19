import parseDate, { convertEndDateToDateList, convertLimitToDateList } from "../src/parseDate";
import { parseExpression } from "cron-parser";

const date = new Date("2023/1/1 00:00:00");

const formatDate = (date: Date, format: string = "yyyy/MM/dd") => {
  format = format.replace(/yyyy/g, String(date.getFullYear()));
  format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/g, ("0" + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ("0" + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));
  format = format.replace(/SSS/g, ("00" + date.getMilliseconds()).slice(-3));
  return format;
};

const cronText = "0 0 1 * * ";

const defaultOptions = {
  limit: 3,
  tz: "Asia/Tokyo",
};

const items = {
  jsDate: date,
  iso: formatDate(date, "yyyy-MM-ddTHH:mm:ss"),
  millisecond: date.getTime(),
};

/**
 * parseDateのテストケース
 * それぞれJSDate,ISO8601,UnitTimestampの値を引数に渡し、期待値が帰って来ることを確認する
 */
test.concurrent.each([
  ["JS Date", items.jsDate],
  ["ISO 8601", items.iso],
  ["Unix timestamp", items.millisecond],
])("Check cronjob %s", async (title, currentDate) => {
  const options = { currentDate, ...defaultOptions };
  const dateList = parseDate(cronText, options);
  expect(dateList.length).toBe(options.limit);

  const idealDateList = [new Date("2023/2/1 00:00"), new Date("2023/3/1 00:00"), new Date("2023/4/1 00:00")];

  const dateList_UTCStringList = dateList.map((date) => date.toUTCString());
  const idealList_UTCStringList = idealDateList.map((date) => date.toUTCString());
  for (let i = 0; i < dateList.length; i++) {
    expect(dateList_UTCStringList[i]).toStrictEqual(idealList_UTCStringList[i]);
  }
});

/**
 * convertEndDateToDateListのテストケース1
 * endDateを指定し、期待通りの個数が帰って来ることを確認する
 */
test("convertEndDateToDateList - pattern 1", () => {
  const currentDate = new Date("2023/1/1 00:00");
  const endDate = new Date("2023/6/30 23:59");
  const cron = parseExpression("0 0 1 * *", { ...defaultOptions, currentDate, endDate });
  const result = convertEndDateToDateList(cron);

  expect(result.length).toBe(endDate.getMonth() - currentDate.getMonth());

  // generate Date with Feb from Jun
  const idealDateList = [2, 3, 4, 5, 6].map((monthNumber) => new Date(new Date("2023/1/1 00:00").setMonth(monthNumber - 1)));
  // [(new Date("2023/2/1 00:00"), new Date("2023/3/1 00:00"), new Date("2023/4/1 00:00"), new Date("2023/5/1 00:00"), new Date("2023/6/1 00:00"))];
  const result_UTCStringList = result.map((date) => date.toUTCString());
  const idealList_UTCStringList = idealDateList.map((date) => date.toUTCString());
  for (let i = 0; i < result.length; i++) {
    expect(result_UTCStringList[i]).toStrictEqual(idealList_UTCStringList[i]);
  }
});

/**
 * convertEndDateToDateListのテストケース2
 * endDateの指定をしないため、関数側で制限された20個の値が返って来ることを確認する
 */
test("convertEndDateToDateList - pattern 2", () => {
  const currentDate = new Date("2023/1/1 00:00");
  const cron = parseExpression("0 0 1 * *", { ...defaultOptions, currentDate });
  const result = convertEndDateToDateList(cron);

  expect(result.length).toBe(20);

  // generate Date with 2022 Feb from 2024 Sep
  const idealDateList = [...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthNumber) => new Date(new Date("2023/1/1 00:00").setMonth(monthNumber - 1))), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((monthNumber) => new Date(new Date("2024/1/1 00:00").setMonth(monthNumber - 1)))];

  const result_UTCStringList = result.map((date) => date.toUTCString());
  const idealList_UTCStringList = idealDateList.map((date) => date.toUTCString());
  for (let i = 0; i < result.length; i++) {
    expect(result_UTCStringList[i]).toStrictEqual(idealList_UTCStringList[i]);
  }
});

/**
 * convertLimitToDateListのテストケース1
 * limit数を指定し、期待値通りのDateリストが返って来ることを確認する
 */
test("convertLimitToDateList - pattern 1", () => {
  const currentDate = new Date("2023/1/1 00:00");
  const limit = 5;
  const cron = parseExpression("0 0 1 * *", { ...defaultOptions, currentDate });
  const result = convertLimitToDateList(cron, limit);

  expect(result.length).toBe(limit);

  const idealDateList = [...[2, 3, 4, 5, 6].map((monthNumber) => new Date(currentDate.setMonth(monthNumber - 1)))];

  const result_UTCStringList = result.map((date) => date.toUTCString());
  const idealList_UTCStringList = idealDateList.map((date) => date.toUTCString());
  for (let i = 0; i < result.length; i++) {
    expect(result_UTCStringList[i]).toStrictEqual(idealList_UTCStringList[i]);
  }
});

/**
 * convertLimitToDateListのテストケース2
 * limit数を指定するが、endDateによりlimit数未満のDateリストが返って来ることを確認する
 */
test("convertLimitToDateList - pattern 2", () => {
  const currentDate = new Date("2023/1/1 00:00");
  const endDate = new Date("2023/3/31 23:59");
  const limit = 5;
  const cron = parseExpression("0 0 1 * *", { ...defaultOptions, currentDate, endDate });
  const result = convertLimitToDateList(cron, limit);

  expect(result.length).toBe(endDate.getMonth() - currentDate.getMonth());

  const idealDateList = [...[2, 3].map((monthNumber) => new Date(currentDate.setMonth(monthNumber - 1)))];

  const result_UTCStringList = result.map((date) => date.toUTCString());
  const idealList_UTCStringList = idealDateList.map((date) => date.toUTCString());
  for (let i = 0; i < result.length; i++) {
    expect(result_UTCStringList[i]).toStrictEqual(idealList_UTCStringList[i]);
  }
});
