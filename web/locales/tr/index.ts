import en from '../en';
import trOverrides from '../tr-overrides.json';

// Turkish locale: English base with Turkish overrides so any untranslated
// key gracefully falls back to English instead of showing a raw key.
const tr = {
  ...en,
  ...trOverrides,
};

export default tr;
