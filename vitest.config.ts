import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/includes/*testing*',
        'src/includes/*commands*',
        'src/includes/test-helpers.ts',
      ],
    },
    projects: [
      {
        test: {
          name: 'release',
          environment: 'node',
          include: ['scripts/**/*.test.mjs'],
        },
      },
      {
        test: {
          name: 'components',
          globals: true,
          include: ['src/**/*.test.ts'],
          testTimeout: 10000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{browser: 'chromium'}],
            viewport: {width: 1280, height: 1000},
            commands: {
              async keyboardInput({page}, options) {
                if (options.press) await page.keyboard.press(options.press);
                if (options.down) await page.keyboard.down(options.down);
                if (options.up) await page.keyboard.up(options.up);
                if (options.type) await page.keyboard.type(options.type);
              },
              async mouseInput({page, frame}, options) {
                if (options.type === 'reset') {
                  await page.mouse.up();
                  await page.mouse.move(0, 0);
                  return;
                }
                if (options.position) {
                  const iframe = await (await frame()).frameElement();
                  const box = await iframe.boundingBox();
                  await page.mouse.move(
                    options.position[0] + (box?.x ?? 0),
                    options.position[1] + (box?.y ?? 0)
                  );
                }
                if (options.type === 'click') {
                  await page.mouse.down();
                  await page.mouse.up();
                }
                if (options.type === 'down') await page.mouse.down();
                if (options.type === 'up') await page.mouse.up();
              },
              async setMedia({page}, options) {
                await page.emulateMedia(options);
              },
            },
          },
        },
      },
    ],
  },
});
