import type { Item } from '$services/types';
import { DateTime } from 'luxon';

export const deserialize = (id: string, item: { [key: string]: string }): Item => {
  return {
    id,
    ...item as any,
    createdAt: DateTime.fromMillis(+item.createdAt),
    endingAt: DateTime.fromMillis(+item.endingAt),
    views: parseInt(item.views),
    likes: parseInt(item.likes),
    bids: parseInt(item.bids),
    price: parseFloat(item.price)
  };
};
