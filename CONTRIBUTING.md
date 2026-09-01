# How to contribute

Thank you for deciding to contribute to the development of the VSCode Elements.

If you don’t feel confident enough to submit code changes, you can still contribute. Did you find
a typo, grammatical error, or unclear documentation? Improving the documentation is a valuable
contribution as well.

If you’re not yet familiar with the code, we recommend tasks labeled as
[“good first issue”](https://github.com/vscode-elements/elements/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22).
These tasks are relatively simple but still important to complete.

If you decide to work on an issue, please indicate it on the issue page to avoid duplication of work.

## Submit a bug report

When submitting a bug report, aim to create a [minimal reproducible example](https://stackoverflow.com/help/minimal-reproducible-example). It’s perfectly fine if the example is a repository with multiple files, as long as it can be started with a few simple commands (e.g., `npm install && npm run dev`).

It’s even better if you create a demo HTML file under the `dev` directory, using [this](https://github.com/vscode-elements/elements/blob/main/dev/_template.html) as a starting point.
Install the dependencies with `npm ci` and start the development server using `npm run start`. Finally, attach the demo HTML file to your issue ticket.

## Open a pull request

Before submitting a pull request, ensure the code follows the styling guidelines and is
well-formatted. It’s easier than it sounds—just use the lint and Prettier scripts (see the README).
Writing tests is not required, but we appreciate it if you add tests for new code. If your changes
affect the user-facing functionality, please update the changelog file.

Commit messages aim to follow the [50/72 style](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

## Publish a release

Releases are created locally with `npm run release`. The command defaults to a patch release; pass
`minor`, `major`, or an explicit version when needed, for example `npm run release -- minor`.

The release assistant requires a clean Git working tree. Before publishing, it previews and updates
`CHANGELOG.md` from commits since the latest tag, synchronizes the package and component versions,
runs the build, tests, lint, and formatting checks, and creates an npm tarball. After confirmation it
creates the release commit and annotated tag, publishes the tarball to npmjs, and optionally pushes
the commit and tag to `origin`. The npm account used locally must have publish access to `nusys-ui`.
