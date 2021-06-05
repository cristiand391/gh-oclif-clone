# gh-oclif-clone

A clone of the [GitHub CLI](https://github.com/cli/cli) built using [oclif](https://oclif.io/).

## Authentication

[Create a GitHub personal access token ](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) and set it as an environment variable:

`export GITHUB_TOKEN=<token>`

## Usage

1. Clone this repo
2. Install the dependencies: `npm i`
3. Run `./bin/run <command>`

### Some examples

#### `repo:list`

TTY output:
```
./bin/run repo:list microsoft --limit 3

Showing 3 of 4085 repositores in @microsoft

microsoft/win32metadata Tooling to generate metadata for Win32 APIs in the Windows SDK.     public
microsoft/winget-pkgs   The Microsoft community Windows Package Manager manifest repository public
microsoft/FLAML         A fast and lightweight AutoML library.                              public

```

Non-TTY output:

Pipe output to `cut` and only print selected columns:
```
./bin/run repo:list microsoft --limit 3 | cut -f 1
microsoft/win32metadata
microsoft/winget-pkgs
microsoft/FLAML

./bin/run repo:list microsoft --limit 3 | cut -f 2
Tooling to generate metadata for Win32 APIs in the Windows SDK.
The Microsoft community Windows Package Manager manifest repository
A fast and lightweight AutoML library.
```
