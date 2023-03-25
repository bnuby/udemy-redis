import { itemsKey, userLikedKey } from '$services/keys';
import { client } from '$services/redis';
import { getItems } from './items';
export const userLikesItem = async (itemId: string, userId: string) => {
    return await client.sIsMember(userLikedKey(userId), itemId);
};

export const likedItems = async (userId: string) => {
    const ids = await client.sMembers(userLikedKey(userId));
    return getItems(ids);
};

export const likeItem = async (itemId: string, userId: string) => {
    const liked = await client.sAdd(userLikedKey(userId), itemId);
    if (liked) await client.hIncrBy(itemsKey(itemId), 'likes', 1);
    return liked;
};

export const unlikeItem = async (itemId: string, userId: string) => {
    const removed = client.sRem(userLikedKey(userId), itemId);
    if (removed) await client.hIncrBy(itemsKey(itemId), 'likes', -1);
    return removed;
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
    const ids = await client.sInter([userLikedKey(userOneId), userLikedKey(userTwoId)]);
    return getItems(ids);
};
