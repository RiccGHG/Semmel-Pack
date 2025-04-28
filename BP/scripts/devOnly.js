import { world, system } from '@minecraft/server';
export const KEY = 'riccsxabdamage...lol.fol'
/**
 * @param {import('@minecraft/server').Player} player
 */
export function getDamageEnable(player) {
  return new Promise((resolve) => {
    system.run(() => {
      const status = player.getDynamicProperty(KEY);
      resolve(status);
    });
  });
}
/**
 * @param {import("@minecraft/server").Player} player
 * @param {Boolean} value
 */
export function setDamageEnable(player, value) {
  system.run(() => {
    player.setDynamicProperty(KEY, value)
  })
}