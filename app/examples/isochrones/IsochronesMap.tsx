'use client';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  useIsochronesParams,
  useIsochronesParamsDispatch,
} from './IsochronesParamsContext';
import DeckGL from '@deck.gl/react';
import {
  ContourLayer,
  ContourLayerPickingInfo,
} from '@deck.gl/aggregation-layers';
import type { PickingInfo } from '@deck.gl/core';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IconLayer } from '@deck.gl/layers';
import { MdOutlineTravelExplore } from 'react-icons/md';
import { humanizeDuration, timeFromDate } from '../utils';
import { isIOS } from 'react-device-detect';
import { promiseStopsIndexWorker } from '../stopSearch/promiseStopsWorker';
import { promiseRouterWorker } from '../router/promiseRouterWorker';
import BANDS from './colors';
import { useWorkerRequest } from '../useWorkerRequest';
import type { RouterRequests, ArrivalsData } from '../router/messages';

const mapStyle = 'mapbox://styles/aubry/cm7jpifn600ql01r302tdhig2';
const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const resolveArrivals = (params: RouterRequests['arrivalsResolution']) =>
  promiseRouterWorker.postMessage({ type: 'arrivalsResolution', ...params });
const resolveOrigin = async (stopId: string) => {
  const stop = await promiseStopsIndexWorker.postMessage({
    type: 'findStopBySourceId',
    stopId,
  });
  if (!stop) throw new Error('Origin stop not found.');
  return { longitude: stop.lon, latitude: stop.lat };
};

type Marker = { latitude: number; longitude: number };
const IsochronesMap: FC = () => {
  const isochronesParams = useIsochronesParams();
  const dispatch = useIsochronesParamsDispatch();
  const request = useMemo(
    () => ({
      origin: isochronesParams.origin,
      departureTime: timeFromDate(isochronesParams.departureTime),
      maxTransfers: 5,
    }),
    [isochronesParams.origin, isochronesParams.departureTime],
  );
  const arrivals = useWorkerRequest(resolveArrivals, request);
  const origin = useWorkerRequest(resolveOrigin, isochronesParams.origin);
  const [dragMarker, setMarker] = useState<Marker>();
  const marker = dragMarker ?? origin.data;
  const [isDragging, setIsDragging] = useState(false);
  const [pinError, setPinError] = useState<string>();
  const pinSequence = useRef(0);
  const loading = arrivals.loading || origin.loading;

  useEffect(() => {
    pinSequence.current += 1;
    // Discard an unfinished drag when the selected origin changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMarker(undefined);
    setPinError(undefined);
    return () => {
      pinSequence.current += 1;
    };
  }, [isochronesParams.origin]);

  const earliestArrivals = useMemo(() => {
    if (!arrivals.data) return undefined;
    const src = new Float32Array(arrivals.data.src.length);
    let offset = 0;
    for (let i = 0; i < arrivals.data.src.length; i += 3) {
      if (arrivals.data.src[i + 2] < isochronesParams.maxDuration) {
        src.set(arrivals.data.src.subarray(i, i + 3), offset);
        offset += 3;
      }
    }
    return { src: src.subarray(0, offset), length: offset / 3 };
  }, [arrivals.data, isochronesParams.maxDuration]);

  const getTooltip = useCallback(({ object }: ContourLayerPickingInfo) => {
    return object &&
      object.contour &&
      Array.isArray(object.contour.threshold) &&
      object.contour.threshold.length >= 2
      ? {
          html: `${humanizeDuration(object.contour.threshold[0] * 60, true)} to ${humanizeDuration(object.contour.threshold[1] * 60, true)} trip`,
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '14px',
          },
        }
      : null;
  }, []);

  const updatePin = useCallback(
    (info: PickingInfo) => {
      if (!info.coordinate) {
        setMarker(undefined);
        return;
      }
      const sequence = ++pinSequence.current;
      setPinError(undefined);
      void promiseStopsIndexWorker
        .postMessage({
          type: 'findStopsByLocation',
          lat: info.coordinate[1],
          lon: info.coordinate[0],
          maxResults: 1,
          radius: 10,
        })
        .then((stops) => {
          if (sequence !== pinSequence.current) return;
          setMarker(undefined);
          if (!stops.length) {
            setPinError('No nearby stop found. Try another position.');
            return;
          }
          dispatch({ type: 'set_origin', origin: stops[0].sourceId });
        })
        .catch(() => {
          if (sequence !== pinSequence.current) return;
          setMarker(undefined);
          setPinError('Unable to find a stop. Try dragging again.');
        });
    },
    [dispatch],
  );
  const startDragging = useCallback(() => {
    pinSequence.current += 1;
    setIsDragging(true);
  }, []);
  const layers = useMemo(
    () => [
      new ContourLayer<ArrivalsData>({
        id: 'isochrones',
        data: earliestArrivals,
        aggregation: 'MIN',
        cellSize: isochronesParams.cellSize,
        contours: BANDS,
        opacity: 0.4,
        getPosition: (_, { index, data, target }) => {
          target[0] = (data as ArrivalsData).src[index * 3];
          target[1] = (data as ArrivalsData).src[index * 3 + 1];
          target[2] = 0;
          return target as [number, number, number];
        },
        getWeight: (_, { index, data }) => {
          return (data as ArrivalsData).src[index * 3 + 2];
        },
        pickable: true,
        gpuAggregation: false,
        zOffset: 0,
      }),
      // deck.gl stores these drag callbacks; refs are only accessed on events.
      // eslint-disable-next-line react-hooks/refs
      new IconLayer<Marker>({
        id: 'icon-layer',
        data: marker ? [marker] : [],
        getIcon: () => ({
          url: 'pin.svg',
          width: 256,
          height: 256,
          mask: true,
          anchorY: 256,
        }),
        sizeScale: 7,
        getSize: () => 5,
        getPosition: (d) => [d.longitude, d.latitude],
        getColor: () => [255, 255, 255],
        pickable: true,
        onDragStart: startDragging,
        onDrag: (info: PickingInfo) => {
          if (info.coordinate) {
            setMarker({
              latitude: info.coordinate[1],
              longitude: info.coordinate[0],
            });
          }
        },
        onDragEnd: (info: PickingInfo) => {
          setIsDragging(false);
          updatePin(info);
        },
      }),
    ],
    [
      earliestArrivals,
      isochronesParams.cellSize,
      marker,
      updatePin,
      startDragging,
    ],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div
        role="status"
        className="align-items flex h-16 shrink-0 flex-row items-center justify-center pb-3 text-gray-400"
      >
        {arrivals.error || origin.error ? (
          <p>
            Unable to load isochrones.{' '}
            <button
              className="text-accent underline"
              onClick={() => {
                arrivals.retry();
                origin.retry();
              }}
            >
              Try again
            </button>
          </p>
        ) : pinError ? (
          <p>{pinError}</p>
        ) : loading ? (
          <>
            <MdOutlineTravelExplore className="mr-2" />{' '}
            <p>Computing isochrones...</p>
          </>
        ) : (
          <p>Drag the cursor to adjust start stop.</p>
        )}
      </div>
      <div className="relative grow overflow-hidden rounded-2xl">
        <DeckGL
          initialViewState={{
            longitude: 8.2275,
            latitude: 46.8182,
            zoom: 6.5,
          }}
          controller={{
            dragPan: !isDragging,
            dragRotate: !isDragging,
          }}
          layers={layers}
          height="100%"
          width="100%"
          getTooltip={getTooltip}
          style={{ mixBlendMode: 'plus-lighter' }}
          useDevicePixels={!isIOS}
          _typedArrayManagerProps={
            isIOS ? { overAlloc: 1, poolSize: 0 } : undefined
          }
        >
          <Map
            reuseMaps
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
          />
        </DeckGL>
      </div>
    </div>
  );
};

export default IsochronesMap;
