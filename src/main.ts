import * as core from '@actions/core'
import * as github from '@actions/github'
import * as exec from '@actions/exec'
import * as fs from 'fs'

import {GitHub} from '@actions/github/lib/utils'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token', {required: true})

    // 从 GitHub context 中获取 issue 的相关信息
    const issueNumber = github.context.payload.issue?.number
    const issueBody = github.context.payload.issue?.body

    if (!issueNumber || !issueBody) {
      core.setFailed('无法获取 issue 的信息')
      return
    }
    // GitHub 客户端
    const octokit = github.getOctokit(token)

    if (await checkPluginLabel(octokit, issueNumber)) {
      // 创建新分支
      const branchName = github.context.actor
      await exec.exec('git', ['checkout', '-b', branchName])
      // 更新 plugins.json
      const plugin: Plugin = {
        id: 'test',
        link: 'nonebot/nonebot2',
        author: 'test',
        desc: 'test',
        name: 'test',
        repo: 'test'
      }
      await updatePlugins(plugin)
      // 提交修改
      const commitMessage = 'test'
      const username = 'Your Name'
      const useremail = 'you@example.com'
      await exec.exec('git', ['config', '--global', 'user.name', username])
      await exec.exec('git', ['config', '--global', 'user.email', useremail])
      await exec.exec('git', ['add', '-A'])
      await exec.exec('git', ['commit', '-m', commitMessage])
      await exec.exec('git', ['push', 'origin', branchName])
      // 提交 PR
      octokit.pulls.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        title: 'test',
        head: branchName,
        base: 'main',
        body: 'test',
        draft: true
      })
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

// 检查 issue 是否带有 Plugin label
async function checkPluginLabel(
  octokit: InstanceType<typeof GitHub>,
  issueNumber: number
): Promise<boolean> {
  const response = await octokit.issues.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber
  })
  const title = response.data.title
  core.info(`Issue title: '${title}'`)
  return title.search('plugin') !== -1
}

interface Plugin {
  id: string
  link: string
  name: string
  desc: string
  author: string
  repo: string
}

// 更新 plugins.json
async function updatePlugins(plugin: Plugin): Promise<void> {
  if (process.env.GITHUB_WORKSPACE) {
    const pluginJsonFilePath = `${process.env.GITHUB_WORKSPACE}/docs/.vuepress/public/plugins.json`
    core.info(pluginJsonFilePath)
    // 构造插件数据
    const pluginObj = {
      id: plugin.id,
      link: plugin.link,
      name: plugin.name,
      desc: plugin.desc,
      author: plugin.author,
      repo: plugin.repo
    }
    // 写入新数据
    fs.readFile(pluginJsonFilePath, 'utf8', function readFileCallback(
      err,
      data
    ) {
      if (err) {
        core.setFailed(err)
      } else {
        const obj = JSON.parse(data)
        obj.push(pluginObj)
        const json = JSON.stringify(obj, null, 2)
        fs.writeFile(pluginJsonFilePath, json, 'utf8', () => {}) // write it back
      }
    })
  }
}

run()
