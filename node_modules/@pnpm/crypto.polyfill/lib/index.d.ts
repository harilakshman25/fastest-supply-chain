import crypto from 'crypto';
export type Hash = (algorithm: string, data: crypto.BinaryLike, outputEncoding: crypto.BinaryToTextEncoding) => string;
export declare const hash: Hash;
