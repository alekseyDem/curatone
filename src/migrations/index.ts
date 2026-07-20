import * as migration_20260720_100609_initial from './20260720_100609_initial';

export const migrations = [
  {
    up: migration_20260720_100609_initial.up,
    down: migration_20260720_100609_initial.down,
    name: '20260720_100609_initial'
  },
];
