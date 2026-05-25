import * as devConfig  from "./firebase.dev";
import * as prodConfig from "./firebase.prod";

const isProd = import.meta.env.MODE === "production";

const config = isProd ? prodConfig : devConfig;

export default config;