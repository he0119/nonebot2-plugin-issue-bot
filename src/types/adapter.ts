/**协议所需要的信息 */
export interface AdapterInfo {
  type: 'Adapter'
  /**PyPI 项目名 */
  id: string
  /**协议 import 包名 */
  link: string
  /**协议名称 */
  name: string
  /**协议介绍 */
  desc: string
  /**仓库/主页链接 */
  repo: string
  /**开发者 */
  author: string
}

/**从议题内容提取协议信息 */
export function extractInfo(body: string, author: string): AdapterInfo {
  const idRegexp = /- id: (.+)/
  const linkRegexp = /- link: (.+)/
  const descRegexp = /- desc: (.+)/
  const nameRegexp = /- name: (.+)/
  const repoRegexp = /- repo: (.+)/

  const idMatch = body.match(idRegexp)
  const id = idMatch ? idMatch[1] : null
  const linkMatch = body.match(linkRegexp)
  const link = linkMatch ? linkMatch[1] : null
  const descMatch = body.match(descRegexp)
  const desc = descMatch ? descMatch[1] : null
  const nameMatch = body.match(nameRegexp)
  const name = nameMatch ? nameMatch[1] : null
  const repoMatch = body.match(repoRegexp)
  const repo = repoMatch ? repoMatch[1] : null

  if (id && link && desc && name && repo) {
    return {
      type: 'Adapter',
      id,
      link,
      author,
      desc,
      name,
      repo
    }
  }
  throw new Error('无法匹配成功')
}
