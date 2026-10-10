import dotenv from "dotenv";

import { createLogger } from "./util/logger";

dotenv.config();

const log = createLogger("index");

log.info("loading application");

void (async () => {
	const { runApp } = await import("./main");
	runApp();
})();
