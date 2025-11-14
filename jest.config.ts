import type { Config } from "jest";
import nextJest from "next/jest.js";
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;
const createJestConfig = nextJest({
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};

export default createJestConfig(config);
