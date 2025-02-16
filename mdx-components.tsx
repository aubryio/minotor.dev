import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children }) => (
      <a
        href={href}
        target={href.startsWith('#') ? undefined : '_blank'}
        rel={href.startsWith('#') ? undefined : 'noopener noreferrer'}
        className="text-accent hover:underline"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code
        className="font-[family-name:var(--font-dm-mono)] text-sm"
        style={{
          whiteSpace: 'pre-line',
          wordWrap: 'break-word',
          wordBreak: 'break-all',
        }}
      >
        {children}
      </code>
    ),
    figure: ({ children }) => <figure className="text-left">{children}</figure>,
    pre: ({ children, style = '' }) => (
      <pre className="rounded-2xl p-4" style={{ ...style }}>
        {children}
      </pre>
    ),
    h3: ({ children }) => {
      const id = children.toLowerCase().replace(/\s+/g, '-');
      return (
        <h3
          className="text-lg font-bold sm:text-xl"
          id={id}
          style={{ paddingBottom: '10px' }}
        >
          <a href={`#${id}`} className="text-gray-400 hover:underline">
            #
          </a>{' '}
          {children}
        </h3>
      );
    },
    ...components,
  };
}
