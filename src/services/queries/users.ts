import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis'; 
import { usernameUniqueKey, usernamesKey, usersKey } from '$services/keys'; 

export const getUserByUsername = async (username: string) => {
  const userId = await (await client.zScore(usernamesKey(), username)).toString(16);
  const user = await client.HGETALL(usersKey(userId));
  if (!user) throw new Error('User not found');
  return deserialize(userId, user);
};

export const getUserById = async (id: string) => {
  const user = await client.hGetAll(usersKey(id));
  return deserialize('', user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
  const id = genId();

  const exists = await client.sIsMember(usernameUniqueKey(), attrs.username);
  if (exists) throw new Error('Username is taken.');
  await client.hSet(usersKey(id), serialize(attrs));
  await client.sAdd(usernameUniqueKey(), attrs.username);
  await client.zAdd(usernamesKey(), {
    value: attrs.username,
    score: parseInt(id, 16),
  });

  return id;
};

const serialize = (user: CreateUserAttrs) => {
  return {
    username: user.username,
    password: user.password,
  };
};

const deserialize = (id: string, user: { [key: string]: string }) => {
  return {
    id,
    username: user.username,
    password: user.password
  };
};


