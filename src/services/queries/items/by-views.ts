import { itemByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from './deserialize';


export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
    let results = (await client.sort(
        itemByViewsKey(),
        {
            GET: [
                '#',
                `${itemsKey('*')}->name`,
                `${itemsKey('*')}->views`,
                `${itemsKey('*')}->endingAt`,
                `${itemsKey('*')}->imageUrl`,
                `${itemsKey('*')}->price`,
            ],
            BY: 'nosort',
            DIRECTION: order,
            LIMIT: {
                offset,
                count,
            }
        }
    )) as string[];

    const items = [];
    while (results.length) {
        const [id, name, views, endingAt, imageUrl, price, ...rest] = results;
        items.push(deserialize(id, { name, views, endingAt, imageUrl, price }));
        results = rest;
    }
    return items;
};
