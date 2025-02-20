import { describe, expect, it } from 'vitest'
import { main } from '../src/main'

describe('cron', () => {
  it('should run a test', async () => {
    const result = await main()

    expect(result).toBe(0)
  })
})
