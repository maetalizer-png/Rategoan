export function createVersionTravel(versions) {
  const list = versions || [];
  let index = Math.max(0, list.length - 1);
  return {
    index() { return index; },
    current() { return list[index]; },
    goto(n) {
      index = Math.max(0, Math.min(list.length - 1, n));
      return list[index];
    },
  };
}
