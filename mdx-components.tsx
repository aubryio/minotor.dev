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
    code: ({ children, className, ...props }) => (
      <code
        {...props}
        className={`font-(family-name:--font-dm-mono) text-sm wrap-anywhere sm:wrap-normal ${className ?? ''}`}
      >
        {children}
      </code>
    ),
    figure: ({ children, ...props }) => (
      <figure {...props} className="w-full min-w-0 text-left">
        {children}
      </figure>
    ),
    pre: ({ children, className, ...props }) => (
      <pre
        {...props}
        className={`max-w-full overflow-x-auto rounded-2xl p-4 whitespace-pre-wrap sm:whitespace-pre ${className ?? ''}`}
      >
        {children}
      </pre>
    ),
    h3: ({ children }) => {
      const id = children.toLowerCase().replace(/\s+/g, '-');
      return (
        <h3 className="mb-3! pt-4 text-lg font-bold sm:text-xl" id={id}>
          <a href={`#${id}`} className="text-gray-400 hover:underline">
            #
          </a>{' '}
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = children.toLowerCase().replace(/\s+/g, '-');
      return (
        <h4 className="mb-3! pt-3 font-semibold" id={id}>
          <a href={`#${id}`} className="text-gray-400 hover:underline">
            #
          </a>{' '}
          {children}
        </h4>
      );
    },
    ...components,
  };
}
