import parseDate, { convertEndDateToDateList, convertLimitToDateList } from "../src/parseDate";

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

test.todo("convertEndDateToDateList");

test.todo("convertLimitToDateList");
