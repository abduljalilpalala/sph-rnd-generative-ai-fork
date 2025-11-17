import fs from 'fs'
import path from 'path'
import { octokit, repoInfo } from './_config.mjs'
;(async function main() {
  const { owner, prNumber, repo } = repoInfo

  // Fetch all unresolved review comments
  const { data: comments } = await octokit.rest.pulls.listReviewComments({
    owner,
    repo,
    pull_number: prNumber,
  })

  const unresolved = comments.filter((c) => !c.resolved)

  let resolvedCount = 0

  // for (const c of unresolved) {
  //   const filePath = path.join(process.cwd(), c.path)
  //   if (!fs.existsSync(filePath)) continue

  //   const lines = fs.readFileSync(filePath, 'utf8').split('\n')
  //   const currentLine = lines[c.original_line - 1] || ''
  //   const snippet = c.body.replace(/`/g, '').slice(0, 100)

  //   if (!currentLine.includes(snippet)) {
  //     try {
  //       await octokit.rest.pulls.resolveReviewComment({
  //         owner,
  //         repo,
  //         comment_id: c.id,
  //       })
  //       resolvedCount++
  //     } catch (err) {
  //       console.error(`Failed to resolve comment ${c.id}: ${err.message}`)
  //     }
  //   }
  // }

  // console.log(`Resolved ${resolvedCount} comments (basic)`)
  console.log(
    `Unresolved ${JSON.stringify(comments, null, 2)} comments (basic)`
  )
})()
