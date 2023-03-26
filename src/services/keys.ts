export const pageCacheKey = (id: string) => 'pagecache#' + id;
export const usersKey = (userId: string) => 'users#' + userId;
export const usernamesKey = () => 'usernames';
export const usernameUniqueKey = () => 'usernames:unique';
export const viewsKey = (viewId: string) => 'views#' + viewId;
export const likesKey = (likeId: string) => 'likes#' + likeId;
export const bidsKey = (bidId: string) => 'bids#' + bidId;
export const sessionsKey = (sessionId: string) => 'sessions#' + sessionId;

// Items
export const itemsKey = (itemId: string) => 'items#' + itemId;
export const itemsViewsKey = (itemId: string) => `items:views#${itemId}`;
export const itemByViewsKey = () => 'items:views';
export const itemsByPriceKey = () => 'items:price';
export const itemsByEndingKey = () => 'items:endingAt';
export const itemLockKey = (itemId: string) => 'lock:items:' + itemId;
export const userItemsKey = (userId: string) => 'users:items:' + userId;
export const userLikedKey = (username: string) => 'users:likes#' + username;
export const bidHistoryKey = (itemId: string) => `history#${itemId}`;