import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        env: {
            NODE_ENV: 'test',
        },
    },
    resolve: {
        alias: {
            '@config': path.resolve(__dirname, './src/config'),
            '@shared': path.resolve(__dirname, './src/shared'),
            '@modules': path.resolve(__dirname, './src/modules'),
        },
    },
});