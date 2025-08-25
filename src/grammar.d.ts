declare module '*.grammar' {
  // Put the import there so that this file is a ambient module
  import { LRParser } from '@lezer/lr';

  export const parser: LRParser;
}
