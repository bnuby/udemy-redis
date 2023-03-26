import { withLock } from './../redis/lock';
import { getItem } from '$services/queries/items/items';
import { DateTime } from 'luxon';
import type { CreateBidAttrs, Bid } from '$services/types';
import { bidHistoryKey, itemsByPriceKey, itemsKey } from '$services/keys'; 
import { client } from '$services/redis';

export const createBid = async (attrs: CreateBidAttrs) => {
	return withLock(attrs.itemId, async (lockedClient: typeof client, signal: any) => {
		const item = await getItem(attrs.itemId);
		if (!item) throw new Error("Item not exists");
		if (item.price >= attrs.amount) throw new Error('Bid too low');
		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) throw new Error('Item closed to bidding');
		const serialized = serialize(attrs.amount, attrs.createdAt.toMillis());
		// Comment out this method, this solution is not that suitable, use Proxy to check on every client get.
		// if (signal.expired) throw new Error('Lock expired, cant write any more data')
		return Promise.all([
			lockedClient.rPush(bidHistoryKey(attrs.itemId), serialized),
			lockedClient.hSet(itemsKey(attrs.itemId), {
				highestBidUserId: attrs.userId,
				price: attrs.amount,
			}),
			lockedClient.zAdd(itemsByPriceKey(), {
				value: item.id,
				score: attrs.amount
			}),
			lockedClient.hIncrBy(itemsKey(attrs.itemId), 'bids', 1)
		]);
	});
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const result =  await client.lRange(
		bidHistoryKey(itemId), 
		- offset - count,
		-1 - offset, 
	);
	return result.map(deserialize);
};

const separator = ':';
const deserialize = (stored: string) => {
	const [amount, createdAt] = stored.split(separator);
	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt)),
	};
};

const serialize = (amount: number, createdAt: number) => {
	return `${amount}${separator}${createdAt}`;
}