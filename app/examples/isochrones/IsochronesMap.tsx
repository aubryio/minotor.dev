'use client';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import PromiseWorker from 'promise-worker';
import {
  useIsochronesParams,
  useIsochronesParamsDispatch,
} from './IsochronesParamsContext';
import DeckGL from '@deck.gl/react';
import {
  ContourLayer,
  ContourLayerPickingInfo,
  ContourLayerProps,
} from '@deck.gl/aggregation-layers';
import type { PickingInfo } from '@deck.gl/core';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useStopsIndex } from '../stopSearch/StopsIndexContext';
import { IconLayer } from '@deck.gl/layers';
import { MdOutlineTravelExplore } from 'react-icons/md';
import { humanizeDuration } from '../utils';

const mapStyle = 'mapbox://styles/aubry/cm7jpifn600ql01r302tdhig2';
const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type ArrivalTime = {
  duration: number;
  position: [number, number];
};

const routerWorker = new Worker(new URL('routerWorker.ts', import.meta.url), {
  type: 'module',
});
const promiseWorker = new PromiseWorker(routerWorker);

export const BANDS: ContourLayerProps['contours'] = [
  { threshold: [0, 60 * 10], color: [0, 255, 51, 255], zIndex: 1 },
  { threshold: [60 * 10, 60 * 20], color: [0, 255, 102, 240], zIndex: 2 },
  { threshold: [60 * 20, 60 * 30], color: [0, 255, 153, 225], zIndex: 3 },
  { threshold: [60 * 30, 60 * 40], color: [0, 255, 204, 210], zIndex: 4 },
  { threshold: [60 * 40, 60 * 50], color: [0, 255, 255, 195], zIndex: 5 },
  { threshold: [60 * 50, 60 * 60], color: [0, 228, 255, 180], zIndex: 6 },
  {
    threshold: [60 * 60, 60 * 60 + 60 * 15],
    color: [0, 171, 255, 165],
    zIndex: 7,
  },
  {
    threshold: [60 * 60 + 60 * 15, 60 * 60 + 60 * 30],
    color: [0, 114, 255, 150],
    zIndex: 8,
  },
  {
    threshold: [60 * 60 + 60 * 30, 60 * 60 + 60 * 45],
    color: [0, 58, 255, 135],
    zIndex: 9,
  },
  {
    threshold: [60 * 60 + 60 * 45, 60 * 60 * 2],
    color: [153, 0, 255, 120],
    zIndex: 10,
  },
  {
    threshold: [60 * 60 * 2, 60 * 60 * 2 + 60 * 20],
    color: [204, 0, 255, 105],
    zIndex: 11,
  },
  {
    threshold: [60 * 60 * 2 + 60 * 20, 60 * 60 * 2 + 60 * 40],
    color: [255, 0, 255, 90],
    zIndex: 12,
  },
  {
    threshold: [60 * 60 * 2 + 60 * 40, 60 * 60 * 3],
    color: [255, 0, 224, 75],
    zIndex: 13,
  },
  {
    threshold: [60 * 60 * 3, 60 * 60 * 3 + 60 * 30],
    color: [255, 0, 195, 60],
    zIndex: 14,
  },
  {
    threshold: [60 * 60 * 3 + 60 * 30, 60 * 60 * 4],
    color: [255, 0, 165, 45],
    zIndex: 15,
  },
  {
    threshold: [60 * 60 * 4, 60 * 60 * 8],
    color: [255, 0, 137, 30],
    zIndex: 16,
  },
];

type Marker = { latitude: number; longitude: number };
const IsochronesMap: FC = () => {
  const isochronesParams = useIsochronesParams();
  const stopsIndex = useStopsIndex();
  const dispatch = useIsochronesParamsDispatch();
  const [earliestArrivals, setEarliestArrivals] = useState<ArrivalTime[]>([]);
  const [marker, setMarker] = useState<Marker | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cellSize, setCellSize] = useState(isochronesParams.cellSize);
  const [hideIsochrones, setHideIsochrones] = useState(false);

  // Prevent shifting glitch
  // TODO investigate issue in contour layer
  useEffect(() => {
    setHideIsochrones(true);
    setTimeout(() => {
      setCellSize(isochronesParams.cellSize);
      setHideIsochrones(false);
    }, 20);
  }, [isochronesParams.cellSize]);

  useEffect(() => {
    const stop = stopsIndex.findStopById(isochronesParams.origin);
    if (!stop || !stop.lon || !stop.lat) {
      return;
    }
    setMarker({
      longitude: stop.lon,
      latitude: stop.lat,
    });
  }, [isochronesParams.origin, stopsIndex]);

  useEffect(() => {
    const fetchEarliestArrivals = async () => {
      const arrivals = await promiseWorker.postMessage({
        origin: isochronesParams.origin,
        departureTime: isochronesParams.departureTime,
      });

      // prevents shifting glitch on some updates
      setEarliestArrivals([]);
      setTimeout(() => {
        setLoading(false);
        setEarliestArrivals(arrivals);
      }, 20);
    };
    setLoading(true);
    fetchEarliestArrivals();
  }, [
    isochronesParams.departureTime,
    isochronesParams.origin,
    setEarliestArrivals,
  ]);
  const getTooltip = useCallback(({ object }: ContourLayerPickingInfo) => {
    return object &&
      object.contour &&
      Array.isArray(object.contour.threshold) &&
      object.contour.threshold.length >= 2
      ? {
          html: `${humanizeDuration(object.contour.threshold[0], true)} to ${humanizeDuration(object.contour.threshold[1], true)} trip`,
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
      if (info.coordinate) {
        const stops = stopsIndex.findStopsByLocation(
          info.coordinate[1],
          info.coordinate[0],
          1,
          10,
        );

        if (stops && stops.length > 0) {
          setMarker({
            latitude: stops[0].lat!,
            longitude: stops[0].lon!,
          });
          dispatch({
            type: 'set_origin',
            origin: stops[0].id,
          });
        }
      }
    },
    [dispatch, stopsIndex],
  );

  const layers = useMemo(
    () => [
      new ContourLayer<ArrivalTime>({
        id: 'ContourLayer',
        //isochronesParams.departureTime.getMilliseconds() +
        //isochronesParams.origin,
        data: hideIsochrones ? [] : earliestArrivals,
        aggregation: 'MIN',
        cellSize: cellSize,
        contours: BANDS,
        opacity: 0.4,
        getPosition: (d: ArrivalTime) => {
          return d.position;
        },
        getWeight: (d: ArrivalTime) => {
          return d.duration;
        },
        pickable: true,
      }),
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
        onDragStart: () => setIsDragging(true),
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
    [hideIsochrones, earliestArrivals, cellSize, marker, updatePin],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="align-items flex h-16 flex-shrink-0 flex-row items-center justify-center pb-3 text-gray-400">
        {loading ? (
          <>
            <MdOutlineTravelExplore className="mr-2" />{' '}
            <p>Computing isochrones...</p>
          </>
        ) : (
          <p>Drag the cursor to adjust start stop.</p>
        )}
      </div>
      <div className="relative flex-grow overflow-hidden rounded-2xl">
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
