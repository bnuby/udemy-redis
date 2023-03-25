import { itemByViewsKey, itemsKey, itemsViewsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    const inserted = await client.pfAdd(itemsViewsKey(itemId), userId);
    if (!inserted) return;
    return Promise.all([
        client.hIncrBy(itemsKey(itemId), 'views', 1),
        client.zIncrBy(itemByViewsKey(), 1, itemId),
    ]);
};
