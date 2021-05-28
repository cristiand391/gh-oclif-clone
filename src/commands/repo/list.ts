import { flags } from "@oclif/command";
import { Command } from "../../command";
import cli from "cli-ux";

export default class RepoList extends Command {
  static description = "List repositories owned by user or organization";

  static flags = {
    help: flags.help({ char: "h" }),
    limit: flags.integer({ char: "L", default: 10 }),
  };

  static args = [
    {
      name: "owner",
      required: true,
      description: "Owner",
    },
  ];

  async run() {
    const { args, flags } = this.parse(RepoList);

    try {
      const data = await this.github.graphql(RepositoryListQuery, {
        owner: args.owner,
        perPage: flags.limit,
      });

      const repos = data.repositoryOwner.repositories.nodes;
      const totalCount = data.repositoryOwner.repositories.totalCount;

      this.log(
        `\nShowing ${repos.length} of ${totalCount} repositores in @${args.owner}`
      );

      cli.table(repos, {
        nameWithOwner: {
          header: "",
          minWidth: 7,
        },
        description: {
          header: "",
          minWidth: 8,
          get: (row) => (row.description === null ? "" : row.description),
        },
        isPrivate: {
          header: "",
          get: (row) => (row.isPrivate === true ? "Private" : "Public"),
        },
      });

      this.log();
    } catch (err) {
      throw err;
    }
  }
}

const RepositoryListQuery = `
    query RepositoryList($owner: String!, $perPage: Int!) {
        repositoryOwner(login: $owner) {
            repositories(first: $perPage, orderBy: { field: PUSHED_AT, direction: DESC }) {
                nodes {
                    nameWithOwner
                    description
                    isPrivate
                }
                totalCount
            }
        }
    }
`;
