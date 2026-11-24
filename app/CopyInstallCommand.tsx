'use client';
import { LuCopy } from 'react-icons/lu';

export default function CopyInstallCommand() {
  return (
    <div>
      <code className="border-accent flex items-center rounded-full border-2 bg-black px-7 py-4 font-(family-name:--font-dm-mono) text-sm tracking-tight text-white">
        npm i minotor
        <button
          type="button"
          aria-label="Copy installation command"
          className="ml-4"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText('npm i minotor');
            } catch {
              // Clipboard access may be denied; keep the interaction silent.
            }
          }}
        >
          <LuCopy aria-hidden="true" />
        </button>
      </code>
    </div>
  );
}
