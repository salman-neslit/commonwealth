import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    video: 'retain-on-failure',
  },
  globalSetup: './globalSetup.ts',
};

export default config;
