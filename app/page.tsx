"use client";
import dynamic from "next/dynamic";

const Home = () => {
  const TransitRouter = dynamic(() => import("./example/TransitRouter"), {
    ssr: false,
  });
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-hanken-sans)]">
      <main className="flex flex-col gap-8 gap-y-4 row-start-2 items-center sm:items-start max-w-screen-md">
        <h1 className="font-bold text-4xl sm:text-5xl">
          m<span className="text-accent">i</span>notor
        </h1>
        <h2 className="text-xl sm:text-2xl">
          A lightweight public transit router built for{" "}
          <span className="text-accent inline-flex flex-col h-[calc(theme(fontSize.xl)*theme(lineHeight.tight))] sm:h-[calc(theme(fontSize.2xl)*theme(lineHeight.tight))] overflow-hidden">
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
        <section className="text-justify space-y-4">
          <p>
            Minotor is an open-source transit router library supporting GTFS
            feeds. Unlike most transit planners out there, minotor can store all
            the transit data for a given day in memory on the client, allowing
            for fast runtime queries using only local data.{" "}
          </p>
        </section>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get started
          </a>
        </div>
        <TransitRouter />
        <section className="text-justify space-y-4 mt-2">
          <h2 className="text-xl sm:text-2xl">Documentation</h2>
          <p>
            This is particularly useful for highly dynamic applications or
            complex visualizations for research purposes where the user needs to
            query the data in real-time. Privacy-conscious applications where
            the user does not want to share their location data with a server
            can also benefit from this model.
          </p>
          <p>
            The transit router and the stops index of minotor can run in the
            browser, on react-native or in a Node.js environment. Transit data
            (GTFS) parsing runs on Node.js, and the resulting data is serialized
            as a protobuf binary that can be loaded from the router.
          </p>
        </section>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Author
        </a>
      </footer>
    </div>
  );
};

export default Home;
