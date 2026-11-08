import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',testMatch:'tme-perf.spec.ts',workers:1,timeout:60000,use:{baseURL:'http://127.0.0.1:4354',viewport:{width:1440,height:1000}},webServer:{command:'pnpm dev --host 127.0.0.1 --port 4354 --ignore-lock',url:'http://127.0.0.1:4354',reuseExistingServer:false}});
