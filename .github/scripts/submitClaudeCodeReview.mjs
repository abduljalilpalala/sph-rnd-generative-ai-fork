import { octokit, repoInfo } from "./_config.mjs"
import { exitWith } from "./_helpers.mjs"

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo

    console.log(
      `🔍 Checking latest Claude Code Review Summary for PR #${prNumber}...`
    )

    // 1️⃣ Fetch all comments
    // const { data: comments } = await octokit.rest.issues.listComments({
    //   owner,
    //   repo,
    //   issue_number: prNumber,
    //   per_page: 100,
    // })

    // // 2️⃣ Find latest Claude review summary
    // const claudeComments = comments.filter((c) =>
    //   c.body?.includes('📄 Claude Code Review Summary')
    // )

    // if (!claudeComments.length) {
    //   console.log('❌ No Claude Code Review Summary found.')
    //   return
    // }

    // // Sort newest → oldest
    // const latestComment = claudeComments.sort(
    //   (a, b) => new Date(b.created_at) - new Date(a.created_at)
    // )[0]

    // const body = latestComment.body || ''

    // // 3️⃣ Extract severity counts from the summary table
    // const criticalMatch = body.match(
    //   /Failed\s*\/\s*Needs Change\s*\|\s*Critical\s*\|\s*(\d+)/
    // )
    // const moderateMatch = body.match(
    //   /Failed\s*\/\s*Needs Change\s*\|\s*Moderate\s*\|\s*(\d+)/
    // )
    // const minorMatch = body.match(
    //   /Minor Concern\s*\/\s*Warning\s*\|\s*Minor\s*\|\s*(\d+)/
    // )

    // const criticalCount = criticalMatch ? parseInt(criticalMatch[1], 10) : 0
    // const moderateCount = moderateMatch ? parseInt(moderateMatch[1], 10) : 0
    // const minorCount = minorMatch ? parseInt(minorMatch[1], 10) : 0

    // console.log(
    //   `📊 Critical: ${criticalCount}, Moderate: ${moderateCount}, Minor: ${minorCount}`
    // )

    // // 4️⃣ Decide approval
    // const needsChanges = criticalCount > 0 || moderateCount > 0

    // const event = needsChanges ? 'REQUEST_CHANGES' : 'APPROVE'
    // const labelToAdd = needsChanges
    //   ? 'Claude Review Changes 🚫'
    //   : 'Claude Review Approved ✅'
    // const labelToRemove = needsChanges
    //   ? 'Claude Review Approved ✅'
    //   : 'Claude Review Changes 🚫'

    // // 5️⃣ Link to summary
    // const summaryUrl = latestComment.html_url
    // const summaryLink = `[📄 Claude Code Review Summary](${summaryUrl})`

    // // 6️⃣ Review message
    // const reviewBody = needsChanges
    //   ? `🚫 Changes required.\n${summaryLink}`
    //   : `✅ Looks good.\n${summaryLink}`

    // console.log(`📝 Submitting review: ${event}`)

    // await octokit.rest.pulls.createReview({
    //   owner,
    //   repo,
    //   pull_number: prNumber,
    //   event,
    //   body: reviewBody,
    // })

    // // 7️⃣ Remove opposite label
    // console.log(`🧹 Removing label if exists: ${labelToRemove}`)
    // try {
    //   await octokit.rest.issues.removeLabel({
    //     owner,
    //     repo,
    //     issue_number: prNumber,
    //     name: labelToRemove,
    //   })
    // } catch (err) {
    //   console.log(`⚠️ Label not found: ${labelToRemove}`)
    // }

    // // 8️⃣ Add correct label
    // console.log(`🏷️ Adding label: ${labelToAdd}`)
    // await octokit.rest.issues.addLabels({
    //   owner,
    //   repo,
    //   issue_number: prNumber,
    //   labels: [labelToAdd],
    // })

    // console.log(`✅ Code review automation completed.`)
  } catch (err) {
    exitWith('❌ Error in submitClaudeCodeReview.mjs:', err)
  }
})()
