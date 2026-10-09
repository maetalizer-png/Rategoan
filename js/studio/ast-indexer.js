export function indexModule(path, source) {
  const code = String(source || '');
  const functions = Array.from(code.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)).map((match) => match[1]);
  const classes = Array.from(code.matchAll(/class\s+([A-Za-z_$][\w$]*)/g)).map((match) => match[1]);
  const globals = Array.from(code.matchAll(/(?:^|\n)\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)).map((match) => match[1]);
  return { path: path || '', functions, classes, globals };
}

export function indexerWorkerSource() {
  return 'onmessage=function(e){var code=String(e.data&&e.data.code||"");var names=[];var re=/function\\s+([A-Za-z_$][\\w$]*)/g;var m;while((m=re.exec(code)))names.push(m[1]);postMessage({functions:names});};';
}
