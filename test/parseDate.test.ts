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

const cronText = "0 0 * * * ";

const defaultOptions = {
  limit: 3,
  tz: "Asia/Tokyo",
};

const items = {
  jsDate: date,
  iso: formatDate(date, "yyyy-MM-ddTHH:mm:ss"),
  millisecond: date.getTime(),
};

test.concurrent.each([
  ["JS Date", items.jsDate],
  ["ISO 8601", items.iso],
  ["Unix timestamp", items.millisecond],
])("Check cronjob %s", async (title, currentDate) => {
  const options = { currentDate, ...defaultOptions };
  const dateList = parseDate(cronText, options);
  expect(dateList.length).toBe(3);

  const idealDateList = [new Date("2023/1/2 00:00"), new Date("2023/1/3 00:00"), new Date("2023/1/4 00:00")];
  expect(dateList.map((date) => date.toUTCString())).toStrictEqual(idealDateList.map((date) => date.toUTCString()));
});

test("convertEndDateToDateList - pattern 1", () => {
  const currentDate = new Date("2023/1/1 00:00");
  const endDate = new Date("2023/6/30 23:59");
  const cron = parseExpression("0 0 1 * *", { ...defaultOptions, currentDate, endDate });
  const result = convertEndDateToDateList(cron);

  expect(result.length).toBe(5);

  // generate Date with Feb from Jun
  const ideaDateList = [2, 3, 4, 5, 6].map((monthNumber) => new Date(new Date("2023/1/1 00:00").setMonth(monthNumber - 1)));
  // [(new Date("2023/2/1 00:00"), new Date("2023/3/1 00:00"), new Date("2023/4/1 00:00"), new Date("2023/5/1 00:00"), new Date("2023/6/1 00:00"))];
  const result_UTCStringList = result.map((date) => date.toUTCString());
  const idealList_UTCStringList = ideaDateList.map((date) => date.toUTCString());
  for (let i = 0; i < result.length; i++) {
    expect(result_UTCStringList[i]).toStrictEqual(idealList_UTCStringList[i]);
  }
});

test("convertEndDateToDateList - pattern 2", () => {
  const currentDate = new Date("2023/1/1 00:00");
  const cron = parseExpression("0 0 1 * *", { ...defaultOptions, currentDate });
  const result = convertEndDateToDateList(cron);

  expect(result.length).toBe(20);

  // generate Date with 2022 Feb from 2024 Sep
  const ideaDateList = [...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthNumber) => new Date(new Date("2023/1/1 00:00").setMonth(monthNumber - 1))), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((monthNumber) => new Date(new Date("2024/1/1 00:00").setMonth(monthNumber - 1)))];

  const result_UTCStringList = result.map((date) => date.toUTCString());
  const idealList_UTCStringList = ideaDateList.map((date) => date.toUTCString());
  for (let i = 0; i < result.length; i++) {
    expect(result_UTCStringList[i]).toStrictEqual(idealList_UTCStringList[i]);
  }
});

test.todo("convertLimitToDateList");