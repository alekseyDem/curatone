import * as migration_20260720_091830_initial from './20260720_091830_initial';

export const migrations = [
  {
    up: migration_20260720_091830_initial.up,
    down: migration_20260720_091830_initial.down,
    name: '20260720_091830_initial'
  },
];
