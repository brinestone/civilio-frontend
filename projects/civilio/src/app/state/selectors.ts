import { createPropertySelectors, createSelector } from "@ngxs/store";
import { CONFIG_STATE } from "./config";

const configSlices = createPropertySelectors(CONFIG_STATE);

export const isConfigValid = configSlices.configured;
