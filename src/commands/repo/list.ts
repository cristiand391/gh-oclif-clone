import { flags } from "@oclif/command";
import { Command } from "../../command";
import cli from "cli-ux";

type Repository = {
  nameWithOwner: string;
  description: string;
  isPrivate: boolean;
};

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

    const limit = flags.limit;
    const perPage = limit > 100 ? 100 : limit;

    let repos: Repository[];

    try {
      let data = await this.github.graphql(RepositoryListQuery, {
        owner: args.owner,
        perPage,
      });

      const { totalCount } = data.repositoryOwner.repositories;

      repos = data.repositoryOwner.repositories.nodes;

      while (data.repositoryOwner.repositories.pageInfo.hasNextPage) {
        if (repos.length == limit) {
          break;
        }

        let { endCursor } = data.repositoryOwner.repositories.pageInfo;

        data = await this.github.graphql(RepositoryListQuery, {
          owner: args.owner,
          perPage,
          endCursor,
        });

        for (let repo of data.repositoryOwner.repositories.nodes) {
          repos.push(repo);
          if (repos.length >= limit) {
            break;
          }
        }
      }

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
  query RepositoryList($owner: String!, $perPage: Int!, $endCursor: String) {
    repositoryOwner(login: $owner) {
      repositories(first: $perPage, after: $endCursor, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          nameWithOwner
          description
          isPrivate
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
    }
}
`;
