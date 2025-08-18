import { ref } from 'vue'
import { useDid } from './useDid'

export function useDidAuth() {
  const { did, privateKey } = useDid()
  const challenge = ref<string | null>(null)
  const signature = ref<string | null>(null)

  async function createChallenge(): Promise<string> {
    if (!did.value) throw new Error('DID not generated')
    
    const randomBytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(randomBytes)
    const challengeValue = btoa(String.fromCharCode(...randomBytes))
    challenge.value = challengeValue
    return challengeValue
  }

  async function signChallenge(): Promise<string> {
    if (!challenge.value || !privateKey.value) {
      throw new Error('Challenge or private key missing')
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(challenge.value)
    const sig = await globalThis.crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey.value,
      data
    )

    const signatureValue = btoa(String.fromCharCode(...new Uint8Array(sig)))
    signature.value = signatureValue
    return signatureValue
  }

  async function verifyChallenge(
    publicKey: CryptoKey, 
    challenge: string, 
    signature: string
  ): Promise<boolean> {
    const encoder = new TextEncoder()
    const data = encoder.encode(challenge)
    const sig = Uint8Array.from(atob(signature), c => c.charCodeAt(0))

    return globalThis.crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      sig,
      data
    )
  }

  return {
    challenge,
    signature,
    createChallenge,
    signChallenge,
    verifyChallenge
  }
}