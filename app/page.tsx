import { FaGithubAlt } from 'react-icons/fa';
import GetStarted from '../doc/get-started.mdx';
import ExampleSwitcher from './examples/ExampleSwitcher';
import CopyInstallCommand from './CopyInstallCommand';
import { DATASET } from './examples/dataset';

const Home = () => {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-(family-name:--font-hanken-sans) sm:p-20">
      <main className="row-start-2 flex w-full max-w-(--breakpoint-md) min-w-0 flex-col items-center gap-8 gap-y-4 sm:items-start">
        <h1 className="text-4xl font-bold sm:text-5xl">
          m<span className="text-accent">i</span>notor
        </h1>
        <h2 className="text-xl sm:text-2xl">
          A public transit routing library built for{' '}
          <span className="text-accent inline-flex h-[calc(var(--text-xl)*(var(--leading-tight)))] flex-col overflow-hidden sm:h-[calc(var(--text-2xl)*(var(--leading-tight)))]">
            <ul className="animate-text-slide block text-left leading-tight motion-reduce:animate-none [&_li]:block">
              <li>data viz.</li>
              <li>research.</li>
              <li>privacy.</li>
              <li>the web.</li>
              <li>mobile apps.</li>
              <li>data science.</li>
              <li>agents.</li>
              <li>AI.</li>
              <li aria-hidden="true">data viz.</li>
            </ul>
          </span>
        </h2>
        <section className="space-y-4 text-left">
          <p>
            Minotor is an open-source transit routing library for the browser,
            Node.js servers and React Native apps. It supports standard and
            extended GTFS feeds, virtual walking transfers, geographic and
            textual stop search, point and range routing queries, and isochrone
            computation. Minotor can store all the transit data for a given day
            in memory on the client, allowing for fast runtime queries using
            only local data.
          </p>
        </section>
        <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row">
          <CopyInstallCommand />
          <div className="flex flex-row items-center gap-4">
            <a
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-white/[.145] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#1a1a1a] sm:h-12 sm:px-5 sm:text-base"
              href="https://github.com/aubryio/minotor"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Minotor on GitHub</span>
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
        <section id="features" className="mt-2 w-full space-y-5 pt-6 text-left">
          <h2 className="text-xl sm:text-2xl">
            <a href="#features" className="text-gray-400 hover:underline">
              #
            </a>{' '}
            Features
          </h2>
          <ul
            role="list"
            className="[&_li]:border-accent/50 grid gap-x-8 gap-y-6 sm:grid-cols-2 [&_li]:border-l-2 [&_li]:pl-4 [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-gray-400 [&_strong]:block [&_strong]:font-semibold"
          >
            <li>
              <strong>GTFS parsing</strong>
              <p>Read feeds with standard and extended profiles.</p>
            </li>
            <li>
              <strong>Virtual walking transfers</strong>
              <p>
                Connect nearby stops missing from the feed&apos;s transfer data.
              </p>
            </li>
            <li>
              <strong>Stop search</strong>
              <p>Find stops by name, source ID, or location.</p>
            </li>
            <li>
              <strong>Point queries</strong>
              <p>Find the earliest arrival from a given departure time.</p>
            </li>
            <li>
              <strong>Range queries</strong>
              <p>Compare Pareto-optimal journeys within a departure window.</p>
            </li>
            <li>
              <strong>Reachability</strong>
              <p>
                Map earliest arrivals or shortest travel times across the
                network.
              </p>
            </li>
          </ul>
        </section>

        <section
          id="example-usage"
          className="mt-2 w-full space-y-4 pt-4 text-left"
        >
          <h2 className="text-xl sm:text-2xl">
            <a href="#example-usage" className="text-gray-400 hover:underline">
              #
            </a>{' '}
            Examples
          </h2>

          <ExampleSwitcher
            routerDescription={
              <>
                <p>
                  An example client-side transit router running in the browser
                  with a web worker. It uses the full data from the Swiss GTFS
                  feed for a day ({DATASET.label}) from{' '}
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
                    href="https://github.com/aubryio/minotor.dev/tree/main/app/examples/planner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    the code from this example
                  </a>
                  .
                </p>
              </>
            }
            isochronesDescription={
              <>
                <p>
                  An example isochrone map running in the browser with a web
                  worker. It uses the full data from the Swiss GTFS feed for a
                  day ({DATASET.label}) from{' '}
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
                <p>
                  A more complete isochrone map showcase relying on minotor can
                  be found on{' '}
                  <a
                    href="https://isochrone.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    isochrone.ch
                  </a>
                  .
                </p>
              </>
            }
          />
        </section>

        <section id="documentation" className="mt-2 w-full space-y-5 text-left">
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
          minotor © 2025–2026 Aubry Cholleton
        </div>
      </footer>
    </div>
  );
};

export default Home;
