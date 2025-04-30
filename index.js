import 'expo-router/entry';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Ceci est nécessaire pour que Expo Router fonctionne
export default function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

// Enregistrement du composant racine
registerRootComponent(App);