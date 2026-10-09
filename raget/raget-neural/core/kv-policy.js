export function createKvWindow(opts) {
  const sinks = (opts && opts.sinks) || 4;
  const span = (opts && opts.span) || 256;
  const head = [];
  const tail = [];
  let seen = 0;
  return {
    push(token) {
      seen += 1;
      if (head.length < sinks) head.push(token);
      else {
        tail.push(token);
        if (tail.length > span) tail.shift();
      }
    },
    stored() { return head.concat(tail); },
    seen() { return seen; },
  };
}
