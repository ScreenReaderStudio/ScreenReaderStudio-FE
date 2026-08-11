import { describe, expect, it, vi } from 'vitest';

import {
  createPreviewHighlighterScript,
  createSafePreviewDocument,
  HIGHLIGHT_MESSAGE_TYPE,
  postHighlightMessage,
  PREVIEW_HIGHLIGHT_ATTRIBUTE,
} from './previewDocument';

const TRUSTED_PARENT_ORIGIN = 'https://studio.example';

interface PreviewMessageEvent {
  data: unknown;
  origin: string;
  source: unknown;
}

function installPreviewHighlighter(document: Document) {
  let messageHandler: ((event: PreviewMessageEvent) => void) | null = null;
  const parentWindow = {};
  const previewWindow = {
    addEventListener: (type: string, handler: (event: PreviewMessageEvent) => void) => {
      if (type === 'message') {
        messageHandler = handler;
      }
    },
    parent: parentWindow,
  };
  type PreviewWindow = typeof previewWindow;
  const executeScript = Function(
    'window',
    'document',
    createPreviewHighlighterScript(TRUSTED_PARENT_ORIGIN)
  ) as (targetWindow: PreviewWindow, previewDocument: Document) => void;

  executeScript(previewWindow, document);

  return {
    dispatchMessage(event: PreviewMessageEvent) {
      if (!messageHandler) {
        throw new Error('미리보기 message handler가 설치되지 않았습니다.');
      }

      messageHandler(event);
    },
    parentWindow,
  };
}

describe('createSafePreviewDocument', () => {
  it('원본 활성 콘텐츠를 제거하고 nonce로 허용한 highlighter만 삽입한다', () => {
    const pageContent = `
      <!doctype html>
      <html>
        <head>
          <base href="https://attacker.example">
          <meta http-equiv="refresh" content="0;url=https://attacker.example">
          <meta http-equiv="Content-Security-Policy" content="script-src * 'unsafe-inline'">
          <script nonce="attacker">parent.document.body.textContent = '공격';</script>
        </head>
        <body onload="parent.localStorage.clear()">
          <a
            id="javascript-link"
            href="java&#x0a;script:parent.document.body.remove()"
            onclick="parent.document.body.remove()"
            ping="https://attacker.example/track"
          >위험 링크</a>
          <a id="data-link" href="data:text/html,<script>parent.document.body.remove()</script>">
            데이터 링크
          </a>
          <img id="safe-image" src="data:image/png;base64,AA==" onerror="parent.alert(1)">
          <button id="unsafe-action" formaction="vbscript:alert(1)">전송</button>
          <iframe srcdoc="<script>parent.document.body.remove()</script>"></iframe>
          <object data="https://attacker.example/plugin"></object>
          <svg><script>parent.document.body.remove()</script></svg>
          <div nonce="attacker" ${PREVIEW_HIGHLIGHT_ATTRIBUTE}="true">기존 표시</div>
        </body>
      </html>
    `;

    const previewContent = createSafePreviewDocument(pageContent, TRUSTED_PARENT_ORIGIN);
    const previewDocument = new DOMParser().parseFromString(previewContent, 'text/html');
    const scripts = previewDocument.querySelectorAll('script');
    const highlighterScript = scripts[0];
    const contentSecurityPolicy = Array.from(previewDocument.querySelectorAll('meta')).find(
      (meta) => meta.httpEquiv.toLowerCase() === 'content-security-policy'
    );

    expect(scripts).toHaveLength(1);
    expect(highlighterScript.getAttribute('data-screen-reader-studio-control')).toBe('highlighter');
    expect(highlighterScript.textContent).not.toContain('parent.document.body.textContent');
    expect(previewDocument.querySelector('base, iframe, object')).toBeNull();
    expect(previewDocument.querySelector('[onload], [onclick], [onerror]')).toBeNull();
    expect(previewDocument.querySelector('#javascript-link')?.hasAttribute('href')).toBe(false);
    expect(previewDocument.querySelector('#javascript-link')?.hasAttribute('ping')).toBe(false);
    expect(previewDocument.querySelector('#data-link')?.hasAttribute('href')).toBe(false);
    expect(previewDocument.querySelector('#unsafe-action')?.hasAttribute('formaction')).toBe(false);
    expect(previewDocument.querySelector('#safe-image')?.getAttribute('src')).toBe(
      'data:image/png;base64,AA=='
    );
    expect(previewDocument.querySelector(`[${PREVIEW_HIGHLIGHT_ATTRIBUTE}]`)).toBeNull();
    expect(previewDocument.querySelector('[nonce="attacker"]')).toBeNull();
    expect(contentSecurityPolicy).toBeDefined();
    expect(contentSecurityPolicy?.content).toContain(
      `script-src 'nonce-${highlighterScript.getAttribute('nonce')}'`
    );
    expect(contentSecurityPolicy?.content).toContain("connect-src 'none'");
    expect(contentSecurityPolicy?.content).toContain("object-src 'none'");
  });

  it('문서의 수동 콘텐츠와 안전한 리소스 URL은 유지한다', () => {
    const previewContent = createSafePreviewDocument(
      `
        <html>
          <head>
            <link rel="stylesheet" href="https://example.com/styles.css">
            <style>h1 { color: navy; }</style>
          </head>
          <body>
            <main aria-label="분석 대상">
              <h1>페이지 제목</h1>
              <img src="https://example.com/image.png" alt="예시">
              <a href="https://example.com/details">자세히 보기</a>
            </main>
          </body>
        </html>
      `,
      TRUSTED_PARENT_ORIGIN
    );
    const previewDocument = new DOMParser().parseFromString(previewContent, 'text/html');

    expect(previewDocument.querySelector('main')?.getAttribute('aria-label')).toBe('분석 대상');
    expect(previewDocument.querySelector('h1')?.textContent).toBe('페이지 제목');
    expect(previewDocument.querySelector('link[rel="stylesheet"]')?.getAttribute('href')).toBe(
      'https://example.com/styles.css'
    );
    expect(previewDocument.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/image.png'
    );
    expect(previewDocument.querySelector('a')?.getAttribute('href')).toBe(
      'https://example.com/details'
    );
  });

  it('경로가 포함되거나 HTTP 계열이 아닌 부모 origin을 거부한다', () => {
    expect(() => createSafePreviewDocument('<h1>제목</h1>', 'https://studio.example/path')).toThrow(
      '미리보기 부모 origin이 올바르지 않습니다.'
    );
    expect(() => createSafePreviewDocument('<h1>제목</h1>', 'file:///preview.html')).toThrow(
      '미리보기 부모 origin이 올바르지 않습니다.'
    );
  });
});

describe('preview highlighter message', () => {
  it('신뢰한 부모의 올바른 메시지만 받아 요소를 순서대로 강조한다', () => {
    const previewDocument = new DOMParser().parseFromString(
      '<main><h1>제목</h1><button>확인</button></main>',
      'text/html'
    );
    const heading = previewDocument.querySelector('h1');
    const button = previewDocument.querySelector('button');
    const scrollIntoView = vi.fn();

    if (!heading || !button) {
      throw new Error('테스트 대상 요소를 만들지 못했습니다.');
    }

    Object.defineProperty(heading, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    const { dispatchMessage, parentWindow } = installPreviewHighlighter(previewDocument);

    dispatchMessage({
      data: { selector: 'h1', type: HIGHLIGHT_MESSAGE_TYPE },
      origin: TRUSTED_PARENT_ORIGIN,
      source: parentWindow,
    });

    expect(heading.getAttribute(PREVIEW_HIGHLIGHT_ATTRIBUTE)).toBe('true');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    dispatchMessage({
      data: { selector: 'button', type: HIGHLIGHT_MESSAGE_TYPE },
      origin: TRUSTED_PARENT_ORIGIN,
      source: parentWindow,
    });

    expect(heading.hasAttribute(PREVIEW_HIGHLIGHT_ATTRIBUTE)).toBe(false);
    expect(button.getAttribute(PREVIEW_HIGHLIGHT_ATTRIBUTE)).toBe('true');
  });

  it('다른 source·origin과 잘못된 type·payload·selector를 무시한다', () => {
    const previewDocument = new DOMParser().parseFromString('<h1>제목</h1>', 'text/html');
    const heading = previewDocument.querySelector('h1');
    const { dispatchMessage, parentWindow } = installPreviewHighlighter(previewDocument);

    if (!heading) {
      throw new Error('테스트 대상 요소를 만들지 못했습니다.');
    }

    const invalidEvents: PreviewMessageEvent[] = [
      {
        data: { selector: 'h1', type: HIGHLIGHT_MESSAGE_TYPE },
        origin: TRUSTED_PARENT_ORIGIN,
        source: {},
      },
      {
        data: { selector: 'h1', type: HIGHLIGHT_MESSAGE_TYPE },
        origin: 'https://attacker.example',
        source: parentWindow,
      },
      {
        data: { selector: 'h1', type: 'unknown' },
        origin: TRUSTED_PARENT_ORIGIN,
        source: parentWindow,
      },
      {
        data: { selector: 42, type: HIGHLIGHT_MESSAGE_TYPE },
        origin: TRUSTED_PARENT_ORIGIN,
        source: parentWindow,
      },
      {
        data: { selector: 'a'.repeat(4097), type: HIGHLIGHT_MESSAGE_TYPE },
        origin: TRUSTED_PARENT_ORIGIN,
        source: parentWindow,
      },
      {
        data: { selector: '[', type: HIGHLIGHT_MESSAGE_TYPE },
        origin: TRUSTED_PARENT_ORIGIN,
        source: parentWindow,
      },
    ];

    invalidEvents.forEach((event) => {
      expect(() => dispatchMessage(event)).not.toThrow();
    });

    expect(heading.hasAttribute(PREVIEW_HIGHLIGHT_ATTRIBUTE)).toBe(false);
  });

  it('opaque-origin iframe의 contentWindow에 검증된 메시지만 전송한다', () => {
    const targetWindow = { postMessage: vi.fn() } as unknown as Window;

    expect(postHighlightMessage(targetWindow, '  main > h1  ')).toBe(true);
    expect(targetWindow.postMessage).toHaveBeenCalledWith(
      { selector: 'main > h1', type: HIGHLIGHT_MESSAGE_TYPE },
      '*'
    );

    expect(postHighlightMessage(targetWindow, '   ')).toBe(false);
    expect(postHighlightMessage(targetWindow, 'a'.repeat(4097))).toBe(false);
    expect(postHighlightMessage(null, 'h1')).toBe(false);
    expect(targetWindow.postMessage).toHaveBeenCalledTimes(1);
  });
});
