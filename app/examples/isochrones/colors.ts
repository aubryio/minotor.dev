import { ContourLayerProps } from '@deck.gl/aggregation-layers';

const BANDS: ContourLayerProps['contours'] = [
  {
    threshold: [0, 60 * 10],
    color: [0, 255, 51, 255],
  },
  {
    threshold: [60 * 10, 60 * 20],
    color: [0, 255, 102, 245],
  },
  {
    threshold: [60 * 20, 60 * 30],
    color: [0, 255, 153, 235],
  },
  {
    threshold: [60 * 30, 60 * 40],
    color: [0, 255, 204, 225],
  },
  {
    threshold: [60 * 40, 60 * 50],
    color: [0, 255, 255, 215],
  },
  {
    threshold: [60 * 50, 60 * 60],
    color: [0, 228, 255, 205],
  },
  {
    threshold: [60 * 60, 60 * 60 + 60 * 15],
    color: [0, 171, 255, 195],
  },
  {
    threshold: [60 * 60 + 60 * 15, 60 * 60 + 60 * 30],
    color: [0, 114, 255, 185],
  },
  {
    threshold: [60 * 60 + 60 * 30, 60 * 60 + 60 * 45],
    color: [0, 58, 255, 175],
  },
  {
    threshold: [60 * 60 + 60 * 45, 60 * 60 * 2],
    color: [153, 0, 255, 165],
  },
  {
    threshold: [60 * 60 * 2, 60 * 60 * 2 + 60 * 20],
    color: [204, 0, 255, 155],
  },
  {
    threshold: [60 * 60 * 2 + 60 * 20, 60 * 60 * 2 + 60 * 40],
    color: [255, 0, 255, 145],
  },
  {
    threshold: [60 * 60 * 2 + 60 * 40, 60 * 60 * 3],
    color: [255, 0, 224, 135],
  },
  {
    threshold: [60 * 60 * 3, 60 * 60 * 3 + 60 * 30],
    color: [255, 0, 195, 125],
  },
  {
    threshold: [60 * 60 * 3 + 60 * 30, 60 * 60 * 4],
    color: [255, 0, 165, 115],
  },
  {
    threshold: [60 * 60 * 4, 60 * 60 * 4 + 60 * 30],
    color: [255, 0, 137, 105],
  },
  {
    threshold: [60 * 60 * 4 + 60 * 30, 60 * 60 * 5],
    color: [255, 0, 100, 95],
  },
  {
    threshold: [60 * 60 * 5, 60 * 60 * 6],
    color: [255, 0, 80, 85],
  },
  {
    threshold: [60 * 60 * 6, 60 * 60 * 8],
    color: [255, 0, 60, 75],
  },
];

export default BANDS;
