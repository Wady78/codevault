import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  listSnippets: vi.fn(),
  getSnippetById: vi.fn(),
  insertSnippet: vi.fn(),
  updateSnippet: vi.fn(),
  deleteSnippet: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(userId = 42): TrpcContext {
  return {
    user: { id: userId, openId: `user-${userId}`, name: "Test User", email: "test@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("snippet procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes list queries to the authenticated user", async () => {
    dbMocks.listSnippets.mockResolvedValue([]);
    await appRouter.createCaller(context(7)).snippets.list({ search: "react" });
    expect(dbMocks.listSnippets).toHaveBeenCalledWith(7, "react");
  });

  it("adds the authenticated owner when creating a snippet", async () => {
    dbMocks.insertSnippet.mockResolvedValue({ id: 11, title: "Fetch", userId: 7 });
    await appRouter.createCaller(context(7)).snippets.create({ title: "Fetch", language: "TypeScript", category: "Utilities", tags: ["fetch", "api"], notes: null, code: "await fetch(url)" });
    expect(dbMocks.insertSnippet).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, tags: "fetch,api" }));
  });

  it("updates favorites through the authenticated owner scope", async () => {
    dbMocks.updateSnippet.mockResolvedValue({ id: 11, favorite: true, userId: 7 });
    await appRouter.createCaller(context(7)).snippets.toggleFavorite({ id: 11, favorite: true });
    expect(dbMocks.updateSnippet).toHaveBeenCalledWith(7, 11, { favorite: true });
  });

  it("rejects access when a snippet is not owned by the user", async () => {
    dbMocks.getSnippetById.mockResolvedValue(undefined);
    await expect(appRouter.createCaller(context(7)).snippets.get({ id: 11 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(dbMocks.getSnippetById).toHaveBeenCalledWith(7, 11);
  });
});
