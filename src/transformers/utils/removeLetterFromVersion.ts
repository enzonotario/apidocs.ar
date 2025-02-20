export function removeLetterFromVersion(version: string): string {
  const match = version.match(/v(.*)/)

  if (match) {
    return match[1]
  }

  return version
}
