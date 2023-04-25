import { readBlockConfig, fetchPlaceholders } from "../../scripts/scripts.js";

export default async function decorate(block) {
  const config = readBlockConfig(block);
  console.log(config);
}