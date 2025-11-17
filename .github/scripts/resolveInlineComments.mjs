import { octokit, repoInfo } from './_config.mjs'

;(async function debugThreads() {
  const { owner, repo, prNumber } = repoInfo

  console.log(`🔍 Fetching review threads for PR #${prNumber}...`)

  const query = `
    query($owner: String!, $repo: String!, $pr: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pr) {
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              comments(first: 50) {
                nodes {
                  id
                  body
                  path
                  originalLine
                  author {
                    login
                  }
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await octokit.graphql(query, {
      owner,
      repo,
      pr: parseInt(prNumber),
    })

    const threads = data.repository.pullRequest.reviewThreads.nodes

    console.log(`\n🧵 Found ${threads.length} review threads\n`)

    threads.forEach((thread, index) => {
      console.log(`──────────────────────────────────────────────`)
      console.log(`THREAD #${index + 1}`)
      console.log(`Thread ID: ${thread.id}`)
      console.log(`Resolved:  ${thread.isResolved ? '✅ Yes' : '❌ No'}`)
      console.log(`Comments:`)

      thread.comments.nodes.forEach((c) => {
        console.log(`
  ➤ Comment ID: ${c.id}
     Author:     ${c.author?.login}
     File:       ${c.path}
     Line:       ${c.originalLine}
     Created:    ${c.createdAt}
     Body:
     ${c.body.replace(/\n/g, '\n       ')}
        `)
      })
    })

    console.log(`──────────────────────────────────────────────`)
    console.log(`\n✨ Done printing all review threads.\n`)
  } catch (err) {
    console.error('❌ Error fetching review threads:', err)
    process.exit(1)
  }
})()
