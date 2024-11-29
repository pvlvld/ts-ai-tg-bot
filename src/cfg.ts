// import dotenv from "dotenv";
// dotenv.config();

const requiredEnv = ["BOT_TOKEN"] as const;

let _log_lvl = 0;
const LOG_LVL = {
    get: () => {
        return _log_lvl;
    },
    set: (lvl: number) => {
        _log_lvl = lvl;
        return _log_lvl;
    },
};

type ICfg = Record<(typeof requiredEnv)[number], string> & {
    ADMINS: number[];
    IGNORE_IDS: number[];
    ANALYTICS_CHAT: number;
    MAIN_CHAT: number;
    LOG_LVL: typeof LOG_LVL;
};

function getCfg() {
    const cfg = {} as ICfg;

    for (const e of requiredEnv) {
        if (e in process.env) {
            cfg[e] = process.env[e]!;
            continue;
        }
        throw new Error(`Bruh, fix your .env! Where's the ${e}?`);
    }
    cfg.ADMINS = (process.env.ADMINS?.split(" ") || []).map((id) => Number(id));
    cfg.IGNORE_IDS = [1087968824, 136817688, 777000, -1];
    cfg.ANALYTICS_CHAT = -1002144414380;
    cfg.MAIN_CHAT = -1002144546621;
    cfg.LOG_LVL = LOG_LVL;

    return Object.freeze(cfg);
}

const cfg = getCfg();

export default cfg;
