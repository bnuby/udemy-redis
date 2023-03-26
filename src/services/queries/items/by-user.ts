import { deserialize } from './deserialize';
import { itemsIndexKey, itemsKey, userItemsKey } from '$services/keys';
import { client } from '$services/redis';
import { getItems } from './items';
interface QueryOpts {
	page: number;
	perPage: number;
	sortBy: string;
	direction: string;
}

export const itemsByUser = async (userId: string, opts: QueryOpts) => {
	const query = `(@ownerId:{${userId}})`;
	const sortCriteria = opts.sortBy && opts.direction && {
		BY: opts.sortBy,
		DIRECTION: opts.direction
	}
	const result = await client.ft.search(
		itemsIndexKey(), 
		query, 
		{
			ON: 'HASH',
			SORTBY: sortCriteria,
			LIMIT: {
				from: opts.page * opts.perPage,
				size: opts.perPage
			}
		} as any);
	
	return {
		totalPages: Math.ceil(result.total / opts.perPage),
		items: result.documents.map(i => deserialize(i.id.replace(itemsKey(''), ''), i.value as Record<string, any>))
	};
};
