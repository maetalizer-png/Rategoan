import { onlineAttention } from './flash-decoding.js';

export function forwardAttention(q, keys, values) {
  return {
    y: onlineAttention(q, keys, values),
    kernel: 'flash-decoding.wgsl',
    materialized: false,
  };
}
