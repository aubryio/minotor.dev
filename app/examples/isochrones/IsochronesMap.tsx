'use client';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
import { IconLayer } from '@deck.gl/layers';
import { MdOutlineTravelExplore } from 'react-icons/md';
import { humanizeDuration } from '../utils';
import { isIOS } from 'react-device-detect';
import { promiseStopsIndexWorker } from '../stopSearch/promiseStopsWorker';
import { promiseRouterWorker } from '../router/promiseRouterWorker';
const mapStyle = 'mapbox://styles/aubry/cm7jpifn600ql01r302tdhig2';
const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type ArrivalTime = {
  duration: number;
  position: [number, number];
};

export const BANDS: ContourLayerProps['contours'] = [
  {
    threshold: [0, 60 * 10],
    color: [0, 255, 51, 255],
    zIndex: 1,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 10, 60 * 20],
    color: [0, 255, 102, 245],
    zIndex: 2,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 20, 60 * 30],
    color: [0, 255, 153, 235],
    zIndex: 3,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 30, 60 * 40],
    color: [0, 255, 204, 225],
    zIndex: 4,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 40, 60 * 50],
    color: [0, 255, 255, 215],
    zIndex: 5,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 50, 60 * 60],
    color: [0, 228, 255, 205],
    zIndex: 6,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60, 60 * 60 + 60 * 15],
    color: [0, 171, 255, 195],
    zIndex: 7,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 + 60 * 15, 60 * 60 + 60 * 30],
    color: [0, 114, 255, 185],
    zIndex: 8,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 + 60 * 30, 60 * 60 + 60 * 45],
    color: [0, 58, 255, 175],
    zIndex: 9,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 + 60 * 45, 60 * 60 * 2],
    color: [153, 0, 255, 165],
    zIndex: 10,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 2, 60 * 60 * 2 + 60 * 20],
    color: [204, 0, 255, 155],
    zIndex: 11,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 2 + 60 * 20, 60 * 60 * 2 + 60 * 40],
    color: [255, 0, 255, 145],
    zIndex: 12,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 2 + 60 * 40, 60 * 60 * 3],
    color: [255, 0, 224, 135],
    zIndex: 13,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 3, 60 * 60 * 3 + 60 * 30],
    color: [255, 0, 195, 125],
    zIndex: 14,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 3 + 60 * 30, 60 * 60 * 4],
    color: [255, 0, 165, 115],
    zIndex: 15,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 4, 60 * 60 * 4 + 60 * 30],
    color: [255, 0, 137, 105],
    zIndex: 16,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 4 + 60 * 30, 60 * 60 * 5],
    color: [255, 0, 100, 95],
    zIndex: 16,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 5, 60 * 60 * 6],
    color: [255, 0, 80, 85],
    zIndex: 16,
    strokeWidth: 0,
  },
  {
    threshold: [60 * 60 * 6, 60 * 60 * 8],
    color: [255, 0, 60, 75],
    zIndex: 16,
    strokeWidth: 0,
  },
];

type Marker = { latitude: number; longitude: number };
const IsochronesMap: FC = () => {
  const isochronesParams = useIsochronesParams();
  const dispatch = useIsochronesParamsDispatch();
  const [earliestArrivals, setEarliestArrivals] = useState<ArrivalTime[]>([]);
  const [marker, setMarker] = useState<Marker | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStop = async () => {
      const stop = await promiseStopsIndexWorker.postMessage({
        type: 'findStopById',
        stopId: isochronesParams.origin,
      });
      if (!stop || !stop.lon || !stop.lat) {
        return;
      }
      setMarker({
        longitude: stop.lon,
        latitude: stop.lat,
      });
    };
    fetchStop();
  }, [isochronesParams.origin]);

  useEffect(() => {
    const fetchEarliestArrivals = async () => {
      const arrivals = await promiseRouterWorker.postMessage({
        type: 'arrivalsResolution',
        origin: isochronesParams.origin,
        departureTime: isochronesParams.departureTime,
      });
      setLoading(false);
      setEarliestArrivals(arrivals);
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
      const fetchStops = async (lat: number, lon: number) => {
        const stops = await promiseStopsIndexWorker.postMessage({
          type: 'findStopsByLocation',
          lat: lat,
          lon: lon,
          maxResults: 1,
          radius: 10,
        });
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
      };
      if (info.coordinate) {
        fetchStops(info.coordinate[1], info.coordinate[0]);
      }
    },
    [dispatch],
  );
  const filteredArrivals = useMemo(
    () =>
      earliestArrivals.filter(
        (arrival) => arrival.duration <= isochronesParams.maxDuration,
      ),
    [earliestArrivals, isochronesParams.maxDuration],
  );
  const layers = useMemo(
    () => [
      new ContourLayer<ArrivalTime>({
        id:
          'ContourLayer' +
          isochronesParams.departureTime.getMilliseconds() +
          isochronesParams.origin,
        data: filteredArrivals,
        aggregation: 'MIN',
        cellSize: isochronesParams.cellSize,
        contours: BANDS,
        opacity: 0.4,
        getPosition: (d: ArrivalTime) => {
          return d.position;
        },
        getWeight: (d: ArrivalTime) => {
          return d.duration;
        },
        pickable: true,
        gpuAggregation: false,
        zOffset: 0,
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
    [
      filteredArrivals,
      isochronesParams.cellSize,
      isochronesParams.origin,
      isochronesParams.departureTime,
      marker,
      updatePin,
    ],
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
