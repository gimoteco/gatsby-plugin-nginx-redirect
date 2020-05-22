import { NginxConfFile } from "nginx-conf";

export async function onPostBuild({ store, reporter }, options) {
  const { redirects } = store.getState();

  NginxConfFile.create(options.inputConfigFile, function (err, conf) {
    if (err) {
      console.log(err);
      return;
    }
    conf.die(options.inputConfigFile);
    conf.flush();

    redirects.forEach((redirect) => {
      conf.nginx.server._add(
        "rewrite",
        `^${redirect.fromPath}$ ^${redirect.toPath}$ ${
          redirect.isPermanent ? "permanent" : "redirect"
        }`
      );
    });

    conf.live(options.outputConfigFile);
    conf.flush();
  });

  reporter.warn(`Redirects ${JSON.stringify(redirects)}`);
}
