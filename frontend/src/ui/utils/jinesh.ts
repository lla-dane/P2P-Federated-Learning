function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // avoid stack overflow for big buffers

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}

// Wrap Base64 with PEM headers
function toPem(base64, label) {
  const lines = base64.match(/.{1,64}/g).join("\n");
  return `-----BEGIN ${label} KEY-----\n${lines}\n-----END ${label} KEY-----`;
}

async function decryptMessage(base64Ciphertext, privateKeyPem) {
  // --- 1. Helpers ---
  function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function pemToArrayBuffer(pem) {
    const b64Lines = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
    return base64ToArrayBuffer(b64Lines);
  }

  // --- 2. Import private key (PKCS#8 PEM) ---
  const keyBuffer = pemToArrayBuffer(privateKeyPem);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );

  // --- 3. Decode ciphertext ---
  const ciphertext = base64ToArrayBuffer(base64Ciphertext);
  console.log("ciphertext ", ciphertext)
  // --- 4. Decrypt ---
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    ciphertext
  );
  console.log("decrypted: ",decrypted)

  // --- 5. Convert to string ---
  return new TextDecoder().decode(decrypted);
}

// Example usage:
const encryptedBase64 =
  "Cvs160/mxuQsgkNaJcSrNxw4rRZCbJWbA971hh/aGgtWvs3sHAgwsT7LJyGn4utbfTJo9d84iQE7I5BSfZhaIVBHakaCV/k1V9jkt887nn3qMWhtOBENE/DqQafewkaoCje1Yev3pkn3tQWX3uxYi8VFeaW2XrHVIPuvMM9XNSJL6gOrZamytl2oKo892GiWIrCzt7a+dzjHt/L4I2aF0kq5Rl8N59L2/07DEXYz7VFH7FokpTajR7XY9O2VbjkynQxBnnl4JEpEQvSKTnDoB1ShuhSHIuOXKC+LNo9K6cc/R3yINdD1+onDncPceCQCqBINqOSQZIH/dv4zzw/5QQ==";

const privateKeyPem=`
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDePdPjmOqxpUP1
wIRYebOOWlQHBjlO0A/JM5xWvJCkek1il3/BLyDkvCck8zT/j8n7ywi5bEGIWyaO
hIRNzpWlMTVp2cjOtjofhBuXth6sw0zATZDUPNDrDUqx2IZKAS3MBSAAirywOohD
/HFF2At0pvVftvA7esrpANVolnaiJtLjGJLX6uyVMmVbgwRLMovNZpTu6Ccn5VFq
6ZD9esIqUWyDuUXCKsNKRgbtwD1wuXyXM2lkl+OhZtSeko85NNSyUxVVR1FL+PCF
UTgtPFJYEFdpG4HnaOPs35cpQe7X9xMm+YtpMGj5UxX4yPMpyaoGeZRoe3RYVUgd
IJeOoRRhAgMBAAECggEAB59PveHgBM1CBjL+5wjviV2cPaxvOT6GGBTC0y++90Ex
l8TR7yaGZon0fr4vrmc4WoA1caSen8ZejWtKnV+NPt/v8Mw1KK/T0QJnLt4icbL2
Fi9i3QCj+rfXPL/MJUwijbmMRjB79cBgLZLCMM7O38adKlX8KdIVlQXADAkDEx8Y
5leESXDqKycTBQvNy1mx5JsqujWujqx8L8owek8yIZHvvxrRrD4PAZ+Sz5WQrXUw
TTZ8W5kcxMd6HbBFA/3Z+upJMSocVocpkfhzkgg1uEwqHWEkHrcXf7HhQK08liw0
Rs0ZC+PnA4+zc8h892386ZaqMlChhtCE+RfcagqlNQKBgQDwGR9pERQrRttXOAeB
jUIqiDaxD7amFnoeTBahXnfop/HOhkEIoHQCEmDm16G5C0yk9q2AybBtU7uegAHs
IjsTtxoYgLFQMRYeU6LjSGPYB4sCyg5DlbyufA3hdgqyFMnPreQLp/447SevQzYY
4dUgyMzbZ/RvS/d+fTgqxw9I9QKBgQDs9fHqmaEgy+gMVMK9WaFPuaJtWmfxRI0g
d8JOSzIQhGMrLr+z4p65SDq48IVGS01g70ZgoyopLr9pH77TSwoLJsGAx5Fc6hVZ
bN+rpxzl4maW/JWoQTD0HqG13UzKMp17KleaHzgti8oFtC9s3nffBWdF8f9V+XvL
NM/LhSKqPQKBgQDbSgbPPoMOV8QjsA/i+nKRSCGzrCdlIKhenZ4Zup+IBkQrHaGu
UGZEMicBD7csvC4/iPHE6/FQmSaGSGH5GvacNiMGeBv6oyqRflAKiGZwu8ryPDu0
7MENGE7ROq/gIG6GWUssfj4KHkidoaR6K2EudVftmM+/C0I77ABtyaujNQKBgGvP
8wOkZpU/cRK7Nedk8moNsgNDEOvLHtLY6kUpHVw6f8xT9tDnmQQAAwfGFz1GYaxq
8YBifHpEVL6FvRLxn143ge8P3emCb7hCOvokjJdjjP3Bam4lSxqnHThbueZ9ZP12
5GixL6Q5Z+90beeAyNVl5fkDBAOgAV0RaEHXD1CZAoGAYaHcjvoJgPaYi+YtKAX2
0JYF35mQiSAzVApiZ7r28iS0TWOPC9Hgz64d67AO9LJq0LTQxirgRVWEq5J5wVYe
Tj4WZxs8fcrPLecvhqxnOvL2rNzHoQpywKY59CwEYbIXZjZ18xIT9bmMK6f7vKOk
NsgLF5J2DWd62dL3tBr7YYQ=
-----END PRIVATE KEY-----
`




export async function jinesh(){

    const { publicKey, privateKey } = await crypto.subtle.generateKey(
              {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1,0,1]),
                hash: "SHA-256"
              },
              true,
              ["encrypt", "decrypt"]
            );
            console.log("public key: ", publicKey)
    
  // Export public key (SPKI)
  const spki = await crypto.subtle.exportKey("spki", publicKey);
  const publicPem = toPem(arrayBufferToBase64(spki), "PUBLIC");

  // Export private key (PKCS#8)
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  const privatePem = toPem(arrayBufferToBase64(pkcs8), "PRIVATE");

  console.log("Public Key:\n", publicPem);
  console.log("Private Key:\n", privatePem);
    decryptMessage(encryptedBase64, privateKeyPem).then(console.log).catch(console.error);

}