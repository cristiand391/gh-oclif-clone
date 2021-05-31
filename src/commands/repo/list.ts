import { flags } from "@oclif/command";
import { Command } from "../../command";
import cli from "cli-ux";

const isTTY = process.stdout.isTTY;

type Repository = {
  nameWithOwner: string;
  description: string;
  visibility: string;
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

      if (isTTY) {
        this.log(
          `\nShowing ${repos.length} of ${totalCount} repositores in @${args.owner}\n`
        );

        cli.table(
          repos,
          {
            nameWithOwner: {
              minWidth: 7,
            },
            description: {
              minWidth: 8,
              get: (row) => (row.description === null ? "" : row.description),
            },
            visibility: {
              get: (row) => (row.isPrivate === true ? "private" : "public"),
            },
          },
          {
            "no-header": true,
          }
        );
        this.log();
      } else {
        let table = "";

        for (let repo of repos) {
          repo.description = repo.description === null ? "" : repo.description;
          repo.visibility = repo.isPrivate ? "private" : "public";

          // Unfortunately `cli.table` always format cells in ways that hurts scriptability.

          // This approach avoids all those problems by:
          // - printing raw values without truncating them
          // - using tabs as separators between columns
          table = table.concat(
            `${repo.nameWithOwner}	${repo.description}	${repo.visibility}\n`
          );
        }

        // Remove newline character from last row.
        table = table.slice(0, -1);

        this.log(table);
      }
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
