# Pitutur Embed & Namespace

## Namespace

```js
Rategoan.Pitutur
// alias
window.Pitutur
```

Contoh:

```js
Rategoan.Pitutur.status();
await Rategoan.Pitutur.loadSource({ title: 'Catatan', text: '...' });
Rategoan.Pitutur.play();
Rategoan.Pitutur.on((ev) => console.log(ev.type, ev.payload));
```

API publik:

| Metode | Fungsi |
|--------|--------|
| `status()` | Status siaran & sumber |
| `progress()` | Progres dokumen |
| `setOptions(opsi)` | mode, docMode, lang, rate, channel, sources |
| `loadSource(payload)` | teks / title / docId |
| `play()` `stop()` `susun()` `pause()` | kontrol siaran |
| `on(fn)` | langganan event |
| `channels()` | daftar saluran |
| `dokumen` `notebook` `embed` | modul terkait |

## postMessage (iframe)

Induk → Pitutur:

```js
iframe.contentWindow.postMessage({
  target: 'pitutur',
  id: '1',
  action: 'loadSource',
  payload: { title: 'Catatan', text: '...', speakMode: 'dialog' }
}, '*');
```

Aksi: `ping` | `status` | `progress` | `setOptions` | `loadSource` | `play` | `stop` | `preview`

Pitutur → Induk:

```js
{ source: 'pitutur', type: 'ready' | 'source:ready' | 'episode:ended' | 'progress', payload }
```

## Deep-link

```
/index.html?doc=<docId>&mode=dialog&docMode=ringkas&lang=id
```
