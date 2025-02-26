'use client';
import dynamic from 'next/dynamic';
import { FaGithubAlt } from 'react-icons/fa';
import { LuCopy } from 'react-icons/lu';
import GetStarted from '../doc/get-started.mdx';
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TbRoute } from 'react-icons/tb';
import { GiSwitzerland } from 'react-icons/gi';

type Example = 'router' | 'isochrones';

const Home = () => {
  const tabsRef = useRef<Record<Example, HTMLElement | null>>({
    router: null,
    isochrones: null,
  });
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const [activeExample, setActiveExample] = useState<'router' | 'isochrones'>(
    'router',
  );
  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (hash === '#isochrones') {
      setActiveExample('isochrones');
    } else if (hash === '#router') {
      setActiveExample('router');
    }
  }, []);

  useEffect(() => {
    const setTabPosition = () => {
      const currentTab = tabsRef.current[activeExample] as HTMLElement;
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
    };

    setTabPosition();
  }, [activeExample]);

  const TransitRouterExample = dynamic(
    () => import('./examples/router/TransitRouterExample'),
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
    () => import('./examples/isochrones/IsochronesMapExample'),
    {
      loading: () => (
        <p className="flex min-h-[442px] items-center justify-center py-6">
          Loading the demo...
        </p>
      ),
      ssr: false,
    },
  );
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-hanken-sans)] sm:p-20">
      <main className="row-start-2 flex max-w-screen-md flex-col items-center gap-8 gap-y-4 sm:items-start">
        <h1 className="text-4xl font-bold sm:text-5xl">
          m<span className="text-accent">i</span>notor
        </h1>
        <h2 className="text-xl sm:text-2xl">
          A public transit routing library built for{' '}
          <span className="inline-flex h-[calc(theme(fontSize.xl)*theme(lineHeight.tight))] flex-col overflow-hidden text-accent sm:h-[calc(theme(fontSize.2xl)*theme(lineHeight.tight))]">
            <ul className="block animate-text-slide text-left leading-tight [&_li]:block">
              <li>data viz.</li>
              <li>research.</li>
              <li>privacy.</li>
              <li>the web.</li>
              <li>mobile apps.</li>
              <li>data science.</li>
              <li aria-hidden="true">data viz.</li>
            </ul>
          </span>
        </h2>
        <section className="space-y-4 text-justify">
          <p>
            Minotor is an open-source transit routing library for the browser,
            nodejs servers and react-native apps. It supports extended GTFS
            feeds parsing, complex routing queries, geographic and textual stops
            search. Unlike most transit planners out there, minotor can store
            all the transit data for a given day in memory on the client,
            allowing for fast runtime queries using only local data.{' '}
          </p>
        </section>
        <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row">
          <code className="flex items-center rounded-full border-2 border-accent bg-black px-7 py-4 font-[family-name:var(--font-dm-mono)] text-sm tracking-tight text-white">
            npm i minotor
            <button
              onClick={() => navigator.clipboard.writeText('npm i minotor')}
              className="ml-4"
            >
              <LuCopy />
            </button>
          </code>
          <div className="flex flex-row items-center gap-4">
            <a
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-white/[.145] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#1a1a1a] sm:h-12 sm:px-5 sm:text-base"
              href="https://github.com/aubryio/minotor"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithubAlt className="text-xl" />
            </a>
            <a
              className="flex h-10 items-center justify-center rounded-full border border-solid border-white/[.145] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#1a1a1a] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base"
              href="#documentation"
            >
              Get started
            </a>
          </div>
        </div>
        <section
          id="example-usage"
          className="mt-2 space-y-4 pt-10 text-justify"
        >
          <h2 className="text-xl sm:text-2xl">
            <a href="#example-usage" className="text-gray-400 hover:underline">
              #
            </a>{' '}
            Examples
          </h2>

          <div className="relative mx-auto flex h-20 w-full flex-row items-center justify-center border-b border-solid border-white/[.08] px-8 text-sm sm:text-base">
            <span
              className="absolute bottom-0 top-0 -z-10 flex overflow-hidden transition-all duration-300"
              style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
            >
              <span className="h-full w-full border-b-2 border-b-accent" />
            </span>
            <button
              ref={(el) => {
                tabsRef.current['router'] = el;
              }}
              className={`${
                activeExample === 'router' ? `` : `hover:text-neutral-300`
              } my-auto flex cursor-pointer select-none flex-col items-center rounded-full px-4 py-2 text-white focus:outline-none`}
              onClick={() => {
                setActiveExample('router');
                window.location.hash = '#router';
              }}
              id="router"
            >
              <TbRoute />
              Transit Planner
            </button>
            <button
              ref={(el) => {
                tabsRef.current['isochrones'] = el;
              }}
              className={`${
                activeExample === 'isochrones' ? `` : `hover:text-neutral-300`
              } my-auto flex cursor-pointer select-none flex-col items-center rounded-full px-4 py-2 text-white focus:outline-none`}
              onClick={() => {
                setActiveExample('isochrones');
                window.location.hash = '#isochrones';
              }}
              id="isochrones"
            >
              <GiSwitzerland />
              Isochrones Map
            </button>
          </div>
          {activeExample === 'router' && (
            <>
              <div>
                <ErrorBoundary
                  fallback={
                    <p className="flex min-h-[442px] items-center justify-center py-6">
                      Something went wrong with the router.
                    </p>
                  }
                >
                  <TransitRouterExample />
                </ErrorBoundary>
              </div>
              <p>
                An example client-side transit router running in the browser
                with a web worker. It uses the full data from the Swiss GTFS
                feed for a day (Sunday February 9th 2025) from{' '}
                <a
                  href="https://opentransportdata.swiss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  opentransportdata.swiss
                </a>{' '}
                , loaded in memory (thus works offline too). Check out{' '}
                <a
                  href="https://github.com/aubryio/minotor.dev/tree/main/app/examples/router"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  the code from this example
                </a>
                .
              </p>
            </>
          )}
          {activeExample === 'isochrones' && (
            <>
              <div>
                <ErrorBoundary
                  fallback={
                    <p className="flex min-h-[442px] items-center justify-center py-6">
                      Something went wrong with the router.
                    </p>
                  }
                >
                  <IsochronesMapExample />
                </ErrorBoundary>
              </div>
              <p>
                An example isochrone map running in the browser with a web
                worker. It uses the full data from the Swiss GTFS feed for a day
                (Sunday February 9th 2025) from{' '}
                <a
                  href="https://opentransportdata.swiss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  opentransportdata.swiss
                </a>{' '}
                loaded in memory and computes the arrival time to all stops in
                the network in real time before rendering the corresponding
                isochrones with deck.gl. Check out{' '}
                <a
                  href="https://github.com/aubryio/minotor.dev/tree/main/app/examples/isochrones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  the code from this example
                </a>
                .
              </p>
            </>
          )}
        </section>

        <section id="documentation" className="mt-2 space-y-5 text-justify">
          <h2 className="text-xl sm:text-2xl">
            <a href="#documentation" className="text-gray-400 hover:underline">
              #
            </a>{' '}
            Get started
          </h2>
          <GetStarted />
        </section>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/aubryio/minotor"
          target="_blank"
          rel="noopener noreferrer"
        >
          Minotor Repo
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/aubryio/minotor.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation Repo
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://aubry.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Author
        </a>
        <div className="flex w-full items-center justify-center text-sm text-gray-500">
          © 2025 Aubry Cholleton
        </div>
      </footer>
    </div>
  );
};

export default Home;
