import { deserialize } from './deserialize';
import { itemsIndexKey } from '$services/keys';
import { client } from '$services/redis';

export const searchItems = async (term: string, size: number = 5) => {
    const cleaned = term
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .split(' ')
        .map(i=> i ? `%${i}%` : '')
        .join(' ');    
    // Look at cleaned and make sure it is valid
    if (cleaned === '') return [];
    const query = `(@name:(${cleaned}) => { $weight: 5.0 }) | (@description:(${cleaned}))`;
    // Use the client to do an actual search
    const result = await client.ft.search(itemsIndexKey(), query, {
        LIMIT: {
            from: 0,
            size,
        },
    });
    // Deserialize and return the search results
    return result.documents.map(({id, value}) => deserialize(id, value as Record<string, any>))

};
