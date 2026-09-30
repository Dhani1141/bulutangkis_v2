import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyC72B2lDi7L9PLBBgegefO3jD86UxBR-cE',
  authDomain:        'bultangv2.firebaseapp.com',
  projectId:         'bultangv2',
  storageBucket:     'bultangv2.firebasestorage.app',
  messagingSenderId: '171193158761',
  appId:             '1:171193158761:web:5bfbe116ecbda0db37e6f8',
  measurementId:     'G-7K851EJ2P3',
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

export const db = getFirestore(app)
export { analytics }
export default app
