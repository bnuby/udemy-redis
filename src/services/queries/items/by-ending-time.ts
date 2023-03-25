import { itemsByEndingKey } from "$services/keys";
import { client } from "$services/redis";
import { getItems } from "./items";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
	let options: Record<string, any> = {
		BY: 'SCORE',
		LIMIT: {
			count,
			offset
		}
	}
	const ids = await client.zRange(itemsByEndingKey(), Date.now(), '+inf', options);
	return await getItems(ids);
	
};
