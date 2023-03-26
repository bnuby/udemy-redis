import { createIndexes } from './create-indexes';
import { itemByViewsKey, itemsKey, itemsViewsKey } from '$services/keys';
import { createClient, defineScript } from 'redis';

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,
	scripts: {
		unlock: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `
				local key = KEYS[1]
				local token = ARGV[1]
				if redis.call('GET', key) == token then
					return redis.call('DEL', key)
				end
			`,
			transformArguments(key: string, token: string) {
				return [key, token]
			},
			transformReply(replay) {
				return replay;
			}
		}),
		addOneAndStore: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `
				local keyToAssignIncrementedNumberTo = KEYS[1];
				redis.call('SET', keyToAssignIncrementedNumberTo, 1 + tonumber(ARGV[1]))
				return redis.call('GET', keyToAssignIncrementedNumberTo)
			`,
			transformArguments(key: string, value: number) {
				return [key, value.toString()];
			},
			transformReply(reply) {
				console.log(reply);
				return reply;
			}
		}),
		incrementView: defineScript({
			NUMBER_OF_KEYS: 3,
			SCRIPT: `
				local itemsViewsKey = KEYS[1]
				local itemsKey = KEYS[2]
				local itemsByViewsKey = KEYS[3]
				local itemId = ARGV[1]
				local userId = ARGV[2]
				local result = {};

				local inserted = redis.call('PFADD', itemsViewsKey, userId);
				if inserted == 1 then
					local hIncrResult = redis.call('HINCRBY', itemsKey, 'views', 1)
					local zIncrResult = redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)
					table.insert(result, hIncrResult)
					table.insert(result, zIncrResult)
				end
				return result
			`,
			transformArguments(itemId: string, userId: string) {
				return [
					itemsViewsKey(itemId), 
					itemsKey(itemId), 
					itemByViewsKey(), 
					itemId, 
					userId
				];
			},
			transformReply() {},
		})
	}
});

client.on('connect', async () => {
	try {
		await createIndexes();
	} catch (e) {
		console.error(e);
	}
	// Use to test custom redis scripts
	// 	await client.addOneAndStore('books:count', 5);
	// 	const result = await client.get('books:count');
	// 	console.log('result', result);
})

client.on('error', (err) => console.error(err));
client.connect();

export { client };
