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
import BANDS from './colors';
const mapStyle = 'mapbox://styles/aubry/cm7jpifn600ql01r302tdhig2';
const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type Marker = { latitude: number; longitude: number };
const IsochronesMap: FC = () => {
  const isochronesParams = useIsochronesParams();
  const dispatch = useIsochronesParamsDispatch();
  const [earliestArrivals, setEarliestArrivals] = useState<
    | {
        src: Float32Array;
        length: number;
      }
    | undefined
  >(undefined);
  const [marker, setMarker] = useState<Marker | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStop = async () => {
      const stop = await promiseStopsIndexWorker.postMessage({
        type: 'findStopBySourceId',
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
        maxDuration: isochronesParams.maxDuration,
      });
      setLoading(false);
      setEarliestArrivals(arrivals);
    };
    setLoading(true);
    fetchEarliestArrivals();
  }, [
    isochronesParams.departureTime,
    isochronesParams.origin,
    isochronesParams.maxDuration,
    setEarliestArrivals,
  ]);
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
            origin: stops[0].sourceId,
          });
        }
      };
      if (info.coordinate) {
        fetchStops(info.coordinate[1], info.coordinate[0]);
      }
    },
    [dispatch],
  );
  const layers = useMemo(
    () => [
      new ContourLayer<{ src: Float32Array; length: number }>({
        id: `ContourLayer_${isochronesParams.departureTime.getTime()}_${isochronesParams.origin}_${isochronesParams.maxDuration}`,
        data: earliestArrivals,
        aggregation: 'MIN',
        cellSize: isochronesParams.cellSize,
        contours: BANDS,
        opacity: 0.4,
        getPosition: (_, { index, data, target }) => {
          target[0] = (data as unknown as { src: Float32Array }).src[index * 3];
          target[1] = (data as unknown as { src: Float32Array }).src[
            index * 3 + 1
          ];
          target[2] = 0;
          return target as [number, number, number];
        },
        getWeight: (_, { index, data }) => {
          return (data as unknown as { src: Float32Array }).src[index * 3 + 2];
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
      earliestArrivals,
      isochronesParams.cellSize,
      isochronesParams.departureTime,
      isochronesParams.maxDuration,
      isochronesParams.origin,
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
