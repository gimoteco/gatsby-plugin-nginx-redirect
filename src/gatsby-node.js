import { NginxConfFile } from "nginx-conf";
import { removeSync } from "fs-extra";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const searchObject = (needle, object) => {
  if (!needle || !object) {
    return object;
  }

  const locations = needle.split('.');

  let foundObject = object;

  locations.forEach((location) => {
    foundObject = recursiveSearch(location, foundObject);
  });

  if (Array.isArray(foundObject) && foundObject.length > 0) {
    return foundObject[0];
  }

  return foundObject || object;
}

const recursiveSearch = (needle, object) => {
  let result = null;

  if (Array.isArray(object)) {
    object.forEach((subObject) => {
      result = recursiveSearch(needle, subObject);
    })
  } else if (typeof object === 'object') {
    for(let key in object) {
      if (key === needle) {
        result = object[key];
      }
      if (!result) {
        result = recursiveSearch(needle, object[key]);
      }
      if (result) {
        return result;
      }
    };
  }

  return result;
}

export async function onPostBuild(
  { store, reporter },
  { outputConfigFile, inputConfigFile, whereToIncludeRedirects = "server" }
) {
  const { redirects } = store.getState();
  removeSync(outputConfigFile);

  return new Promise((resolve) => {
    NginxConfFile.create(inputConfigFile, async function (err, conf) {
      if (err) {
        console.log(err);
        return;
      }

      conf.die(inputConfigFile);
      conf.flush();
      await sleep(500);

      let foundObject = searchObject(whereToIncludeRedirects, conf.nginx);
      if (foundObject) {
        redirects.forEach((redirect) => {
          foundObject._add(
            'rewrite',
            `^${redirect.fromPath}\\/?$ ${redirect.toPath} ${redirect.isPermanent ? "permanent" : "redirect"}`
          )
        });
      }

      conf.live(outputConfigFile);
      conf.flush();

      await sleep(500);

      resolve();
    });

    reporter.warn(`Added redirects to ${outputConfigFile}`);
  });
}
