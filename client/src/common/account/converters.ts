import { siv } from "@noble/ciphers/aes";
import { fromBase64, toBase64, fromHex } from "@cosmjs/encoding";
import { EncryptedResponse } from "../codegen/Chat.types";

const ENC_KEY_LEN = 32;

export function addressToSalt(address: string): string {
  return address.repeat(2);
}

export function generateBindingHashPassword(
  timestamp: string,
  account: string
): string {
  const randomDecimal = Math.random();
  return `${timestamp}${randomDecimal}${account}`;
}

function timestampToNonce(timestamp: string): string {
  return timestamp.slice(0, 12);
}

function getCipher(encKey: Uint8Array, nonce: Uint8Array) {
  if (encKey.length !== ENC_KEY_LEN) {
    throw new Error(`Encryption key must be ${ENC_KEY_LEN} bytes`);
  }
  return siv(encKey, nonce);
}

function encrypt(msg: string, encKey: Uint8Array, nonce: string): string {
  const nonceBytes = new TextEncoder().encode(nonce);
  const msgBytes = new TextEncoder().encode(msg);
  const cipher = getCipher(encKey, nonceBytes);

  const encrypted = cipher.encrypt(msgBytes);
  return toBase64(encrypted);
}

function decrypt(encMsg: string, encKey: Uint8Array, nonce: string): string {
  const nonceBytes = new TextEncoder().encode(nonce);
  const cipher = getCipher(encKey, nonceBytes);
  const msgBytes = fromBase64(encMsg);

  const decrypted = cipher.decrypt(msgBytes);
  return new TextDecoder().decode(decrypted);
}

function serialize<T>(data: T): string {
  return JSON.stringify(data);
}

function deserialize<T>(data: string): T {
  return JSON.parse(data) as T;
}

export function serializeEncrypt<T>(
  encKey: string, // hex string
  timestamp: string,
  value: T
): EncryptedResponse {
  const key = fromHex(encKey);

  // Ensure key length
  if (key.length !== ENC_KEY_LEN) {
    throw new Error(`Encryption key must be ${ENC_KEY_LEN} bytes`);
  }

  const nonce = timestampToNonce(timestamp);
  const serializedValue = serialize(value);
  const encryptedValue = encrypt(serializedValue, key, nonce);

  return {
    value: encryptedValue,
    timestamp: timestamp.toString(),
  };
}

export function decryptDeserialize<T>(
  encKey: string, // hex string
  timestamp: string,
  value: string
): T {
  const key = fromHex(encKey);

  // Ensure key length
  if (key.length !== ENC_KEY_LEN) {
    throw new Error(`Encryption key must be ${ENC_KEY_LEN} bytes`);
  }

  const nonce = timestampToNonce(timestamp);
  const decryptedData = decrypt(value, key, nonce);

  return deserialize<T>(decryptedData);
}
