import { expect, test } from "@oclif/test";

describe("repo:list ", () => {
  // TODO: find a way to mock `process.stdout.isTTY` and add non-TTY tests
  // https://github.com/oclif/fancy-test/issues/113

  describe("with limit", () => {
    test
      .nock("https://api.github.com", (api) =>
        api
          .post("/graphql")
          .replyWithFile(200, "test/commands/repo/repoList.json", {
            "Content-Type": "application/json",
          })
      )
      .stdout()
      .command(["repo:list", "cristiand391", "-L", "3"])
      .it("succeeds", (ctx) => {
        expect(ctx.stdout).to.equal(`
Showing 3 of 19 repositores in @cristiand391

cristiand391/gh-oclif-clone                                                public     
cristiand391/cli                       GitHub’s official command line tool public     
cristiand391/nextjs-loop-api-endpoints                                     public     

`);
      });
  });
});
