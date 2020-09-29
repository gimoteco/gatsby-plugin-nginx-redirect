import { NginxConfFile } from "nginx-conf";
import { remove } from "fs-extra";
import { get } from "lodash";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function onPostBuild(
  { store, reporter },
  { outputConfigFile, inputConfigFile, whereToIncludeRedirects = "server" }
) {
  const { redirects } = store.getState();
  await remove(outputConfigFile);

  return new Promise((resolve) => {
    NginxConfFile.create(inputConfigFile, async function (err, conf) {
      if (err) {
        console.log(err);
        return;
      }

      conf.die(inputConfigFile);
      conf.flush();
      await sleep(500);

      redirects.forEach((redirect) => {
        get(conf.nginx, whereToIncludeRedirects)._add(
          "rewrite",
          `^${redirect.fromPath}\\/?$ ${redirect.toPath} ${
            redirect.isPermanent ? "permanent" : "redirect"
          }`
        );
      });

      conf.live(outputConfigFile);
      conf.flush();
      await sleep(500);
      resolve();
    });

    reporter.warn(`Added redirects to ${outputConfigFile}`);
  });
}
