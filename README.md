# unitconv

A small TypeScript library for converting between units of length, mass, time,
and temperature. No dependencies.

## Install

```bash
npm install
npm run build
```

## Use

```ts
import { convert } from './src/units.ts';

convert(100, 'C', 'F'); // => { value: 212, from: 'C', to: 'F', dimension: 'temperature' }
convert(1, 'km', 'm');  // => { value: 1000, from: 'km', to: 'm', dimension: 'length' }
convert(1, 'km', 'kg'); // throws: dimension mismatch: km is length, kg is mass
```

## Test

```bash
npm test
```

## License

MIT
