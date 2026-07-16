const RPC = require("discord-rpc");
const pm2 = require("pm2");

const clientId = "BOT_ID_HERE";
const BOT_NAME = "djt-bot";

const rpc = new RPC.Client({ transport: "ipc" });

rpc.on("ready", () => {
    console.log("PiClinton presence connected.");

    updatePresence();

    setInterval(updatePresence, 15000);
});

rpc.login({ clientId }).catch(console.error);

function updatePresence() {

    pm2.connect(err => {
        if (err) {
            console.error("PM2 connection error:", err);
            return;
        }

        pm2.list((err, processes) => {

            if (err) {
                console.error("PM2 list error:", err);
                pm2.disconnect();
                return;
            }

            const bot = processes.find(p => p.name === BOT_NAME);

            if (!bot) {
                console.log("Bot process not found.");
                pm2.disconnect();
                return;
            }

            const uptime = new Date(bot.pm2_env.pm_uptime);
            const status = bot.pm2_env.status;
            const cpu = bot.monit.cpu;
            const memoryMB = Math.round(bot.monit.memory / 1024 / 1024);

            rpc.setActivity({
                details: "Monitoring The Trump Bot",
                state: `Monitoring: ${status} | CPU ${cpu}% | RAM ${memoryMB}MB`,
                startTimestamp: uptime,
                largeImageKey: "trumpgaming",
                largeImageText: "Fuck Donald Trump",
                instance: false
            });

            pm2.disconnect();
        });

    });
}
