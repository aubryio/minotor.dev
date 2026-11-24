'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { TbRoute } from 'react-icons/tb';
import { GiSwitzerland } from 'react-icons/gi';

type Example = 'router' | 'isochrones';
const TransitRouterExample = dynamic(
  () => import('./planner/TransitRouterExample'),
  {
    loading: () => (
      <p className="flex min-h-[442px] items-center justify-center py-6">
        Loading the demo...
      </p>
    ),
    ssr: false,
  },
);
const IsochronesMapExample = dynamic(
  () => import('./isochrones/IsochronesMapExample'),
  {
    loading: () => (
      <p className="flex min-h-[442px] items-center justify-center py-6">
        Loading the demo...
      </p>
    ),
    ssr: false,
  },
);

export default function ExampleSwitcher({
  routerDescription,
  isochronesDescription,
}: {
  routerDescription: ReactNode;
  isochronesDescription: ReactNode;
}) {
  const [active, setActive] = useState<Example>('router');
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      if (hash === '#router' || hash === '#isochrones')
        setActive(hash.slice(1) as Example);
    };
    // Initialize from, and subscribe to, browser navigation.
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <>
      <div
        role="group"
        aria-label="Examples"
        className="mx-auto flex h-20 w-full items-stretch justify-center border-b border-white/8 text-sm sm:text-base"
      >
        {(['router', 'isochrones'] as const).map((example) => (
          <button
            key={example}
            id={example}
            type="button"
            aria-pressed={active === example}
            aria-controls="example-panel"
            className={`flex flex-col items-center justify-center border-b-2 px-4 py-2 text-white ${active === example ? 'border-b-accent' : 'border-transparent hover:text-neutral-300'}`}
            onClick={() => {
              setActive(example);
              window.location.hash = example;
            }}
          >
            {example === 'router' ? <TbRoute /> : <GiSwitzerland />}
            {example === 'router' ? 'Transit Planner' : 'Isochrones Map'}
          </button>
        ))}
      </div>
      <div id="example-panel" role="region" aria-labelledby={active}>
        <ErrorBoundary
          key={active}
          fallbackRender={({ resetErrorBoundary }) => (
            <div
              role="alert"
              className="flex min-h-[442px] items-center justify-center gap-2 py-6"
            >
              Unable to display this example.{' '}
              <button
                onClick={resetErrorBoundary}
                className="text-accent underline"
              >
                Try again
              </button>
            </div>
          )}
        >
          {active === 'router' ? (
            <TransitRouterExample />
          ) : (
            <IsochronesMapExample />
          )}
        </ErrorBoundary>
      </div>
      {active === 'router' ? routerDescription : isochronesDescription}
    </>
  );
}
