export const HIGHLIGHT_MESSAGE_TYPE = 'highlight';
export const PREVIEW_HIGHLIGHT_ATTRIBUTE = 'data-screen-reader-studio-highlighted';
export const PREVIEW_SANDBOX = 'allow-scripts';

const MAX_HIGHLIGHT_SELECTOR_LENGTH = 4096;
const BLOCKED_ELEMENT_SELECTOR =
  'applet, base, embed, frame, frameset, iframe, object, portal, script';
const URL_ATTRIBUTES = new Set([
  'action',
  'background',
  'formaction',
  'href',
  'poster',
  'src',
  'xlink:href',
]);
const NAVIGATION_URL_ATTRIBUTES = new Set(['action', 'formaction', 'href', 'xlink:href']);

export interface HighlightMessage {
  selector: string;
  type: typeof HIGHLIGHT_MESSAGE_TYPE;
}

function createPreviewNonce() {
  const bytes = new Uint8Array(16);

  globalThis.crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isUnsafeUrl(attributeName: string, value: string) {
  try {
    const url = new URL(value, 'https://preview.invalid');

    if (url.protocol === 'javascript:' || url.protocol === 'vbscript:') {
      return true;
    }

    return url.protocol === 'data:' && NAVIGATION_URL_ATTRIBUTES.has(attributeName);
  } catch {
    return true;
  }
}

function sanitizeDocument(document: Document) {
  document.querySelectorAll(BLOCKED_ELEMENT_SELECTOR).forEach((element) => element.remove());
  document.querySelectorAll('meta[http-equiv]').forEach((element) => element.remove());

  document.querySelectorAll('*').forEach((element) => {
    element.removeAttribute(PREVIEW_HIGHLIGHT_ATTRIBUTE);

    Array.from(element.attributes).forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();

      if (
        attributeName.startsWith('on') ||
        attributeName === 'nonce' ||
        attributeName === 'ping' ||
        attributeName === 'srcdoc'
      ) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (URL_ATTRIBUTES.has(attributeName) && isUnsafeUrl(attributeName, attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    });
  });
}

export function createHighlightMessage(selector: unknown): HighlightMessage | null {
  if (typeof selector !== 'string') {
    return null;
  }

  const normalizedSelector = selector.trim();

  if (
    normalizedSelector.length === 0 ||
    normalizedSelector.length > MAX_HIGHLIGHT_SELECTOR_LENGTH
  ) {
    return null;
  }

  return {
    selector: normalizedSelector,
    type: HIGHLIGHT_MESSAGE_TYPE,
  };
}

export function createPreviewHighlighterScript(trustedParentOrigin: string) {
  const config = JSON.stringify({
    highlightAttribute: PREVIEW_HIGHLIGHT_ATTRIBUTE,
    maxSelectorLength: MAX_HIGHLIGHT_SELECTOR_LENGTH,
    messageType: HIGHLIGHT_MESSAGE_TYPE,
    trustedParentOrigin,
  });

  return `
(() => {
  'use strict';

  const config = ${config};
  let highlightedElement = null;

  window.addEventListener('message', (event) => {
    const message = event.data;

    if (
      event.source !== window.parent ||
      event.origin !== config.trustedParentOrigin ||
      typeof message !== 'object' ||
      message === null ||
      Array.isArray(message) ||
      message.type !== config.messageType ||
      typeof message.selector !== 'string'
    ) {
      return;
    }

    const selector = message.selector.trim();

    if (selector.length === 0 || selector.length > config.maxSelectorLength) {
      return;
    }

    let nextElement;

    try {
      nextElement = document.querySelector(selector);
    } catch {
      return;
    }

    if (!nextElement) {
      return;
    }

    highlightedElement?.removeAttribute(config.highlightAttribute);
    highlightedElement = nextElement;
    highlightedElement.setAttribute(config.highlightAttribute, 'true');

    if (typeof highlightedElement.scrollIntoView === 'function') {
      highlightedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  });
})();
  `.trim();
}

function createContentSecurityPolicy(nonce: string) {
  return [
    "default-src 'none'",
    `script-src 'nonce-${nonce}'`,
    "style-src 'unsafe-inline' http: https: data: blob:",
    'img-src http: https: data: blob:',
    'font-src http: https: data:',
    'media-src http: https: data: blob:',
    "connect-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

export function createSafePreviewDocument(pageContent: string, trustedParentOrigin: string) {
  const parsedParentOrigin = new URL(trustedParentOrigin);

  if (
    !['http:', 'https:'].includes(parsedParentOrigin.protocol) ||
    parsedParentOrigin.origin !== trustedParentOrigin
  ) {
    throw new Error('미리보기 부모 origin이 올바르지 않습니다.');
  }

  const document = new DOMParser().parseFromString(pageContent, 'text/html');
  const nonce = createPreviewNonce();

  sanitizeDocument(document);

  const contentSecurityPolicy = document.createElement('meta');
  contentSecurityPolicy.setAttribute('http-equiv', 'Content-Security-Policy');
  contentSecurityPolicy.setAttribute('content', createContentSecurityPolicy(nonce));
  document.head.prepend(contentSecurityPolicy);

  const highlightStyle = document.createElement('style');
  highlightStyle.setAttribute('data-screen-reader-studio-control', 'highlight-style');
  highlightStyle.textContent = `[${PREVIEW_HIGHLIGHT_ATTRIBUTE}="true"] { outline: 3px solid #ff0000 !important; outline-offset: 2px !important; }`;
  document.head.append(highlightStyle);

  const serializedDocument = document.documentElement.outerHTML;
  const bodyClosingTagIndex = serializedDocument.lastIndexOf('</body>');

  if (bodyClosingTagIndex === -1) {
    throw new Error('안전한 미리보기 문서를 만들지 못했습니다.');
  }

  const highlighterScript = createPreviewHighlighterScript(trustedParentOrigin).replaceAll(
    '</script',
    '<\\/script'
  );
  const highlighterMarkup = `<script data-screen-reader-studio-control="highlighter" nonce="${nonce}">${highlighterScript}</script>`;
  const previewDocument = `${serializedDocument.slice(0, bodyClosingTagIndex)}${highlighterMarkup}${serializedDocument.slice(bodyClosingTagIndex)}`;

  return `<!doctype html>\n${previewDocument}`;
}

export function postHighlightMessage(targetWindow: Window | null, selector: unknown) {
  const message = createHighlightMessage(selector);

  if (!targetWindow || !message) {
    return false;
  }

  // sandbox에 allow-same-origin이 없어 대상 origin은 opaque하다. 정확한 WindowProxy로 보내고
  // 수신부에서 부모 origin과 event.source를 모두 검증한다.
  targetWindow.postMessage(message, '*');

  return true;
}
