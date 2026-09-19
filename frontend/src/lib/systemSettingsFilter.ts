import type { SystemSetting } from '../types'

const MODIFIED_FILTER = '@modified'

export function filterSystemSettings(
  settings: SystemSetting[],
  query: string,
): SystemSetting[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('vi')
  const onlyModified = normalizedQuery
    .split(/\s+/)
    .includes(MODIFIED_FILTER)
  const searchTerms = normalizedQuery
    .split(/\s+/)
    .filter((term) => term && term !== MODIFIED_FILTER)

  return settings.filter((setting) => {
    if (onlyModified && !setting.isModified) {
      return false
    }

    const searchableText = [
      setting.title,
      setting.description,
      setting.key,
      setting.category,
    ]
      .join(' ')
      .toLocaleLowerCase('vi')
    return searchTerms.every((term) => searchableText.includes(term))
  })
}
