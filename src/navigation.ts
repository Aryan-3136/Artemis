export const views = [
  "month",
  "safety-net",
  "goal",
  "mix",
  "downturn",
  "plan",
] as const;
export function stepFromSearch(search: string) {
  const index = views.indexOf(
    new URLSearchParams(search).get("view") as (typeof views)[number],
  );
  return index < 0 ? 0 : index;
}
export function stepUrl(index: number, current: string) {
  const url = new URL(current);
  url.searchParams.set("view", views[index] ?? views[0]);
  url.hash = "";
  return `${url.pathname}${url.search}`;
}
