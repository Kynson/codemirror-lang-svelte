import { defineConfig } from 'vite';

import LezerGrammarPlugin from './dev/plugins/lezer-grammar-plugin';
// import DTSPlugin from 'unplugin-dts/vite';
import DTSPlugin from 'vite-plugin-dts';
import grammarResolver from './dev/plugins/dts-grammar-resolver';

export default defineConfig({
  plugins: [
    LezerGrammarPlugin(),
    DTSPlugin({
      include: ['src/index.ts', 'src/**/*.grammar', 'src/**/*.d.ts'],
      resolvers: [grammarResolver],
    }),
  ],
  server: {
    fs: { allow: ['src', 'dev', 'index.html'] },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [/@codemirror\/.+/, /@lezer\/.+/],
    },
  },
});
