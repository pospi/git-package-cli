# Git package CLI

Useful CLI commands for working with NPM modules which are referenced and packaged as git repositories; especially useful in microfrontend architectures.

## Usage

Use this module when:

- You want to track sub-components of your nodejs apps as entirely independent git repositories
- You want to use only NPM as a package manager and avoid other things which complicate setup for developers & end-users
- Your team isn't comfortable with git submodules

Sound good? Read on&mdash;

## How to use this with your project

These commands can offer a reasonably seamless development experience, provided you follow a few necessary conventions in your setup:

- Sub-components:
	- must have a `package.json` file in the root of the repository in order to be used directly as an NPM module via git
	- should use the `prepare` package script to perform any initial compilation or building necessary to import the component
- The "main app" repository:
	- can have its `package.json` wherever it wants, or be a monorepo with several packages, whatever...
	- should add the directory `./submodules` adjacent to any `package.json` files to `.gitignore`

That's it! Provided the above are followed, you may then run:

- `git-package checkout [moduleId]` to clone a working copy of the specified module into the `./submodules` folder.
- `git-package sync [moduleId]` to update `package.json` to reference the **active version** of the given module in your working copy. Usually you will want to commit this change to the repo in order to update the dependency for others.

## License

MIT
