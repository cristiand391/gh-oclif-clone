import { Command as Base } from "@oclif/command";
import { APIClient } from "./api-client";

export abstract class Command extends Base {
  _github!: APIClient;

  get github(): APIClient {
    if (this._github) {
      return this._github;
    }
    try {
      this._github = new APIClient();
      return this._github;
    } catch (err) {
      throw err;
    }
  }
}
