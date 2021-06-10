import { flags } from "@oclif/command";
import { Command } from "../../command";
import { repo } from "../../flags";
import cli from "cli-ux";

const isTTY = process.stdout.isTTY;

type Issue = {
  title: string;
  body: string;
};

type Payload = {
  issue: Issue;
  repositoryId: string;
};

export default class IssueCreate extends Command {
  static description = "Create a new issue";

  static flags = {
    help: flags.help({ char: "h" }),
    title: flags.string({ char: "t" }),
    body: flags.string({ char: "b" }),
    repo: repo(),
  };

  async run() {
    const { flags } = this.parse(IssueCreate);

    const owner = flags.repo?.[0];
    const name = flags.repo?.[1];

    try {
      const data = await this.github.graphql(RepositoryInfoQuery, {
        owner,
        name,
      });

      if (!data.repository.hasIssuesEnabled) {
        this.log("Issues are disabled!");
        this.exit();
      }

      const payload: Payload = {
        issue: {
          title: flags.title ?? "",
          body: flags.body ?? "",
        },
        repositoryId: data.repository.id,
      };

      if (isTTY) {
        if (payload.issue.title == "") {
          payload.issue.title = await cli.prompt("Title");
        }

        if (payload.issue.body == "") {
          payload.issue.body = await cli.prompt("Body");
        }
      }

      if (isTTY) {
        this.log(
          `\nTitle: ${payload.issue.title}\nBody: ${payload.issue.body}\n`
        );

        let submit = await cli.confirm("Submit?");

        if (!submit) {
          this.exit();
        }
      }

      let newIssue = await this.github.graphql(IssueCreateMutation, {
        input: {
          ...payload.issue,
          repositoryId: payload.repositoryId,
        },
      });

      this.log(newIssue.createIssue.issue.url);
    } catch (err) {
      throw err;
    }
  }
}

const RepositoryInfoQuery = `
  query RepositoryInfo($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      hasIssuesEnabled
    }
  }
`;

const IssueCreateMutation = `
  mutation IssueCreate($input: CreateIssueInput!) {
    createIssue(input: $input) {
      issue {
        url
      }
    }
  }
`;
