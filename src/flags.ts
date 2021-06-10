import { flags } from "@oclif/command";

export const repo = flags.build({
  name: "repo",
  char: "R",
  description: "Select a repository using the OWNER/REPO format",
  required: true,
  parse: (input) => {
    let args = input.split("/");

    if (args.length !== 2) {
      throw new Error("Please use the format OWNER/REPO");
    }
    return args;
  },
});
