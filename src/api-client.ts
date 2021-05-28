import { graphql } from "@octokit/graphql";

export class APIClient {
  private _graphqlWithAuth: typeof graphql;
  private _auth?: string;

  constructor() {
    try {
      this._graphqlWithAuth = graphql.defaults({
        headers: {
          authorization: `token ${this.auth}`,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  get auth(): string | undefined {
    if (process.env.GITHUB_TOKEN == "") {
      throw new Error("Please set a valid token");
    }
    this._auth = process.env.GITHUB_TOKEN;

    return this._auth;
  }

  async graphql(query: string, params: any): Promise<any> {
    try {
      return await this._graphqlWithAuth(query, params);
    } catch (err) {
      throw err;
    }
  }
}
