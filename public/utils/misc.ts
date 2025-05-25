export const pad2 = (n: number) => `${n}`.padStart(2, "0");

export const formatTime = (date: Date) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;

export const formatDateTime = (date: Date) =>
  `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${formatTime(date)}`;


export function indexBy<T>(arr: T[], selector: (item: T) => string | number) {
  return arr.reduce<{ [key: string | number]: T }>((index, item) => {
    index[selector(item)] = item;
    return index;
  }, {});
}
