import { NginxConfFile } from "nginx-conf";
import { remove } from "fs-extra";

export async function onPostBuild({ store, reporter }, options) {
  const { redirects } = store.getState();

  NginxConfFile.create(options.inputConfigFile, async function (err, conf) {
    if (err) {
      console.log(err);
      return;
    }

    conf.die(options.inputConfigFile);
    conf.flush();

    redirects.forEach((redirect) => {
      conf.nginx.server._add(
        "rewrite",
        `^${redirect.fromPath}\\/?$ ${redirect.toPath} ${
          redirect.isPermanent ? "permanent" : "redirect"
        }`
      );
    });

    await remove(options.outputConfigFile);
    conf.live(options.outputConfigFile);
    conf.flush();
  });

  reporter.warn(`Added redirects to ${options.outputConfigFile}`);
}
