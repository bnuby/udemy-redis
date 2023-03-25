import { userItemsKey } from '$services/keys';
import { client } from '$services/redis';
import { getItems } from './items';
interface QueryOpts {
	page: number;
	perPage: number;
	sortBy: string;
	direction: string;
}

export const itemsByUser = async (userId: string, opts: QueryOpts) => {
	const itemIds = await client.sMembers(userItemsKey(userId));
	const items = await getItems(itemIds);
	return items;
};
