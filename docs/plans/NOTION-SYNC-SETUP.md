# Notion plan sync setup

The GitHub Action syncs dated plan Markdown files into the Engineering Plans data source in Notion.

## One-time setup

1. Add the workflow, script, tests, and updated plan template from this change to the repository.
2. Create a Notion internal connection for this automation. Enable **Read content**, **Insert content**, and **Update content** capabilities, then add the connection to the Engineering Plans database.
3. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**. Name it `NOTION_API_KEY` and paste the Notion connection token there. Do not commit the token or put it in a plan file.
4. In GitHub, open **Actions → Sync engineering plans to Notion → Run workflow**. Use `pending` and keep **dry_run** enabled first. Review the log; it should list the three existing pending plans without making Notion API calls.
5. After confirming the preview, run the workflow again with `pending` and **dry_run** disabled. This creates or updates those three Notion records.

## Ongoing behavior

- A push to `main` that changes a Markdown file under `docs/plans/pending/` or `docs/plans/implemented/` syncs the changed file.
- Moving a plan from `pending/` to `implemented/` keeps the same Notion page when the file name or frontmatter `id` remains stable. Set the plan's status to `implemented` and fill in its Outcome.
- Manual scope `pending` imports all pending plans; `all` imports pending and implemented plans; `changed` uses the Git push's changed files.
- Existing plans without YAML frontmatter use their file name (without `.md`) as the plan key. Their summary is taken from the first paragraph under `## Goal`; Type and dependencies stay blank unless explicitly provided.
- New plans should use the frontmatter and sections in `README.md`. `depends_on` values must match another plan's `id` or, for an existing legacy plan, its file name without `.md`.
- The sync updates page properties and replaces the Notion page body with the Markdown content plus a link to its GitHub source. It does not delete Notion pages when source files are deleted.

The data-source ID is configured in the workflow file. If the Engineering Plans database is replaced, update `NOTION_DATA_SOURCE_ID` there as well.
