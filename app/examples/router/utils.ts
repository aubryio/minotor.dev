"use client";
import { setOptions, unzip } from "unzipit";

setOptions({ workerURL: "/workers/unzipit-worker.module.js" });

export const fetchCompressedData = async (
  location: string,
): Promise<Uint8Array> => {
  const response = await fetch(location);
  const blob = await response.blob();
  const { entries: entries } = await unzip(blob);
  const file = await entries[Object.keys(entries)[0]].blob();
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

type SuspenseResult<T> = {
  read(): T;
};

export function suspensify<T>(promise: Promise<T>): SuspenseResult<T> {
  let status: "pending" | "success" | "error" = "pending";
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    (r: T) => {
      status = "success";
      result = r;
    },
    (e: unknown) => {
      status = "error";
      error = e;
    },
  );

  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw error;
      } else {
        return result;
      }
    },
  };
}
