import { ref } from 'vue'

export function useDid() {
  const did = ref<string | null>(null)
  const privateKey = ref<CryptoKey | null>(null)
  const publicKey = ref<CryptoKey | null>(null)

  async function generateDid(): Promise<string> {
    try {
      const keyPair = await globalThis.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        true,
        ['sign', 'verify']
      )

      const exportedPublicKey = await globalThis.crypto.subtle.exportKey(
        'jwk',
        keyPair.publicKey
      )

      const didKey = `did:key:${btoa(JSON.stringify(exportedPublicKey))}`
      did.value = didKey
      privateKey.value = keyPair.privateKey
      publicKey.value = keyPair.publicKey

      return didKey
    } catch (error) {
      console.error('Error generating DID:', error)
      throw error
    }
  }

  return {
    did,
    privateKey,
    publicKey,
    generateDid
  }
}