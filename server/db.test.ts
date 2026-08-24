import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => {
  const set = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  return {
    update: vi.fn(() => ({ set })),
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(async () => []) })) })) })),
    set,
  };
});

vi.mock("drizzle-orm/mysql2", () => ({ drizzle: vi.fn(() => dbMock) }));

import { updateSnippet } from "./db";

describe("snippet timestamp updates", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "mysql://test";
    dbMock.update.mockClear();
    dbMock.set.mockClear();
  });

  it("writes a fresh UTC millisecond updatedAt for edits and favorites", async () => {
    const beforeEdit = Date.now();
    await updateSnippet(7, 11, { title: "Edited title" });
    const firstUpdatedAt = dbMock.set.mock.calls[0]?.[0]?.updatedAt as number;
    expect(firstUpdatedAt).toBeGreaterThanOrEqual(beforeEdit);
    expect(firstUpdatedAt).toBeLessThanOrEqual(Date.now());

    await new Promise(resolve => setTimeout(resolve, 2));
    await updateSnippet(7, 11, { favorite: true });
    const secondUpdatedAt = dbMock.set.mock.calls[1]?.[0]?.updatedAt as number;
    expect(secondUpdatedAt).toBeGreaterThan(firstUpdatedAt);
    expect(secondUpdatedAt).toBeLessThanOrEqual(Date.now());
  });
});
