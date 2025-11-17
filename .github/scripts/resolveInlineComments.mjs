import { octokit, repoInfo } from './_config.mjs'

const gql = String.raw

;(async function main() {
  const { owner, repo, prNumber } = repoInfo

  const query = gql`
    query ($owner: String!, $repo: String!, $pr: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pr) {
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              comments(first: 100) {
                nodes {
                  id
                  body
                  path
                  originalLine
                  diffHunk
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

    const threads = data?.repository?.pullRequest?.reviewThreads?.nodes || []

    console.log(`Found ${threads.length} review threads\n`)

    const formatted = threads.map((t) => ({
      threadId: t.id,
      isResolved: t.isResolved,
      comments: t.comments.nodes.map((c) => ({
        id: c.id,
        body: c.body,
        path: c.path,
        originalLine: c.originalLine,
        diffHunk: c.diffHunk,
      })),
    }))

    console.log('Review Comment Threads:')
    console.log(JSON.stringify(formatted, null, 2))

    return formatted
  } catch (err) {
    console.error('Error fetching review comments:', err)
    process.exit(1)
  }
})()
