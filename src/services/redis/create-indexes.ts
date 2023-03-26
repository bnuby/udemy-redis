import { SchemaFieldTypes } from 'redis';
import { itemsIndexKey, itemsKey } from "$services/keys";
import { client } from "./client";

export const createIndexes = async () => {

    const indexes = await client.ft._list();

    const exists = indexes.find(index => index === itemsIndexKey());
    if (exists) return;

    return client.ft.create(itemsIndexKey(), {
        name: {
            type: SchemaFieldTypes.TEXT,
            SORTABLE: true
        },
        description: {
            type: SchemaFieldTypes.TEXT,
            SORTABLE: 'UNF'
        },
        ownerId: {
            type: SchemaFieldTypes.TAG,
            SORTABLE: 'UNF'
        },
        endingAt: {
            type: SchemaFieldTypes.NUMERIC,
            SORTABLE: true
        },
        bids: {
            type: SchemaFieldTypes.NUMERIC,
            SORTABLE: true
        },
        views: {
            type: SchemaFieldTypes.NUMERIC,
            SORTABLE: true
        },
        price: {
            type: SchemaFieldTypes.NUMERIC,
            SORTABLE: true
        },
        likes: {
            type: SchemaFieldTypes.NUMERIC,
            SORTABLE: true
        }
    }, { ON: 'HASH', PREFIX: itemsKey('') })
};
