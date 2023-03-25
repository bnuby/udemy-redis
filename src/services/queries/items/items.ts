import type { CreateItemAttrs } from '$services/types';
import { client } from '$services/redis';
import { genId } from '$services/utils';
import { itemsByEndingKey, itemByViewsKey, itemsKey, userItemsKey } from '$services/keys';
import { serialize } from './serialize';
import { deserialize } from './deserialize';

export const getItem = async (id: string) => {
	const item = await client.hGetAll(itemsKey(id));
	if (Object.keys(item).length === 0) return null;
	return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
	return await Promise.all(ids.map((id) => getItem(id)));
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
	const id = genId();
	const serialized = serialize(attrs);
	await Promise.all([
		client.hSet(itemsKey(id), serialized),
		client.sAdd(userItemsKey(userId), id),
		client.zAdd(itemByViewsKey(), {
			value: id,
			score: 0
		}),
		client.zAdd(itemsByEndingKey(), {
			value: id,
			score: serialized.endingAt,
		}),
	]);
	return id;
};
