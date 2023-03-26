import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    return client.incrementView(itemId, userId);
};

// The notes to rewrite a javascript function to lua
// Keys I need to access
// 1) itemsViewsKey
// 2) itemsKey
// 3) itemsByViewsKey

// Arguments I need to accept
// 1) itemId
// 2) userId