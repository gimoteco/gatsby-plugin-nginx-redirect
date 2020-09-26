import { NginxConfFile } from "nginx-conf";
import { remove } from "fs-extra";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function onPostBuild({ store, reporter }, options) {
  const { redirects } = store.getState();
  await remove(options.outputConfigFile);

  return new Promise((resolve) => {
    NginxConfFile.create(options.inputConfigFile, async function (err, conf) {
      if (err) {
        console.log(err);
        return;
      }

      conf.die(options.inputConfigFile);
      conf.flush();
      await sleep(500);

      redirects.forEach((redirect) => {
        conf.nginx.server._add(
          "rewrite",
          `^${redirect.fromPath}\\/?$ ${redirect.toPath} ${
            redirect.isPermanent ? "permanent" : "redirect"
          }`
        );
      });

      conf.live(options.outputConfigFile);
      conf.flush();
      await sleep(500);
      resolve();
    });

    reporter.warn(`Added redirects to ${options.outputConfigFile}`);
  });
}
