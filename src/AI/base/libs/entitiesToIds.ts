import { GameEntity } from '../core/GameEntity';

export function entitiesToIds(array: GameEntity[]) {
  const ids = [];

  for (let i = 0, l = array.length; i < l; i++) {
    ids.push(array[i].uuid);
  }

  return ids;
}
