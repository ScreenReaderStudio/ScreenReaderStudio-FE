import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { type ComponentProps, type ReactNode } from 'react';
import { afterEach, vi } from 'vitest';

import type { ImageProps } from 'next/image';
import type { LinkProps } from 'next/link';

vi.mock('next/image', () => ({
  default: (props: ImageProps) => {
    const { src, alt, width, height, ...restProps } = props;
    delete restProps.priority;
    const srcString =
      typeof src === 'string'
        ? src
        : 'src' in src
          ? src.src
          : typeof src === 'object' && src && 'default' in src
            ? String(src.default)
            : '';

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        height={height}
        src={srcString}
        width={width}
        {...(restProps as ComponentProps<'img'>)}
      />
    );
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: LinkProps & { children?: ReactNode }) => {
    return (
      <a href={href as string} {...(props as ComponentProps<'a'>)}>
        {children}
      </a>
    );
  },
}));

afterEach(() => {
  cleanup();
});
