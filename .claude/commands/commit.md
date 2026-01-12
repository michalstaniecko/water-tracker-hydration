# Commit Command

Review the current changes and create a commit with an appropriate message.

## Instructions

1. Run `git status` to see all changed files (do not use -uall flag)
2. Run `git diff` to see unstaged changes and `git diff --staged` to see staged changes
3. Run `git log --oneline -5` to see recent commit message style

4. Analyze all changes and draft a commit message:
   - Determine the type of change (feat, fix, refactor, docs, test, chore, style)
   - Write a concise summary (50 chars or less) in imperative mood
   - Add a body if needed to explain the "why" (wrap at 72 chars)
   - Follow the commit style used in the repository

5. Stage all relevant changes with `git add`

6. Create the commit using this format:
   ```
   git commit -m "$(cat <<'EOF'
   <type>: <short summary>

   <optional body explaining why>

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

7. Run `git status` to verify the commit succeeded

## Important

- Do NOT commit files that may contain secrets (.env, credentials, etc.)
- Do NOT push to remote unless explicitly asked
- If there are no changes to commit, inform the user
- Ask for confirmation before committing if the changes are significant
