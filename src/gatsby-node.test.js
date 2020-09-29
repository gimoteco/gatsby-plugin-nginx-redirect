import { onPostBuild } from "./gatsby-node";
import { pathExists, remove, readFile } from "fs-extra";

describe("gatsby-node", () => {
  describe("onPostBuild", () => {
    let redirects = [];
    let reporterMock = {
      warn: jest.fn(),
    };
    let storeMock = {
      getState: jest.fn().mockReturnValue({
        redirects,
      }),
    };
    const options = {
      inputConfigFile: `${__dirname}/__tests__/sampleNginx.conf`,
      outputConfigFile: `${__dirname}/__tests__/sampleNginx.out.conf`,
    };
    const options2 = {
      inputConfigFile: `${__dirname}/__tests__/sampleNginx2.conf`,
      outputConfigFile: `${__dirname}/__tests__/sampleNginx2.out.conf`,
      whereToIncludeRedirects: "http.server",
    };

    beforeEach(async () => {
      await remove(options.outputConfigFile);
      await remove(options2.outputConfigFile);
      redirects = [];
      storeMock = {
        getState: jest.fn().mockReturnValue({
          redirects,
        }),
      };
    });

    afterEach(async () => {
      await remove(options.outputConfigFile);
      await remove(options2.outputConfigFile);
    });

    it("should generate an out file", async () => {
      await onPostBuild(
        {
          reporter: reporterMock,
          store: storeMock,
        },
        options
      );

      expect(await pathExists(options.outputConfigFile)).toBe(true);
    });

    it("should add redirect to file out file", async () => {
      const redirects = [
        { fromPath: "/hello", toPath: "/world", isPermanent: true },
      ];
      storeMock.getState.mockReturnValue({ redirects });

      await onPostBuild(
        {
          reporter: reporterMock,
          store: storeMock,
        },
        options
      );

      redirects.forEach(async (redirect) => {
        expect(await readFile(options.outputConfigFile, "utf-8")).toContain(
          `rewrite ^${redirect.fromPath}\\/?$ ${redirect.toPath} permanent;`
        );
      });
    });

    it("should add redirect to file outfile2 ", async () => {
      const redirects = [
        { fromPath: "/hello", toPath: "/world", isPermanent: true },
      ];
      storeMock.getState.mockReturnValue({ redirects });

      await onPostBuild(
        {
          reporter: reporterMock,
          store: storeMock,
        },
        options2
      );

      redirects.forEach(async (redirect) => {
        expect(await readFile(options2.outputConfigFile, "utf-8")).toContain(
          `rewrite ^${redirect.fromPath}\\/?$ ${redirect.toPath} permanent;`
        );
      });
    });

    it("should use the root block if no path was passed ", async () => {
      const redirects = [
        { fromPath: "/hello", toPath: "/world", isPermanent: true },
      ];
      storeMock.getState.mockReturnValue({ redirects });
      const options = {
        inputConfigFile: `${__dirname}/__tests__/sampleNginx2.conf`,
        outputConfigFile: `${__dirname}/__tests__/sampleNginx2.out.conf`,
        whereToIncludeRedirects: "",
      };

      await onPostBuild(
        {
          reporter: reporterMock,
          store: storeMock,
        },
        options
      );

      redirects.forEach(async (redirect) => {
        expect(await readFile(options.outputConfigFile, "utf-8")).toContain(
          `rewrite ^${redirect.fromPath}\\/?$ ${redirect.toPath} permanent;`
        );
      });
    });
  });
});
