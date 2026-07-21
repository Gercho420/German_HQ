import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as storage from "./storage";
import { notifyOwner } from "./_core/notification";

// Mock the database and storage modules
vi.mock("./db");
vi.mock("./storage");
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-001",
    email: "admin@test.com",
    name: "Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "user-001",
    email: "user@test.com",
    name: "User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("gallery", () => {
  it("list returns photos from database (public)", async () => {
    const mockPhotos = [
      { id: 1, title: "Photo 1", description: null, imageUrl: "/test.jpg", storageKey: "test.jpg", category: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(db.getGalleryPhotos).mockResolvedValue(mockPhotos);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.gallery.list();

    expect(result).toEqual(mockPhotos);
    expect(db.getGalleryPhotos).toHaveBeenCalledOnce();
  });

  it("upload requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.gallery.upload({ fileName: "test.jpg", fileBase64: "dGVzdA==", contentType: "image/jpeg" })
    ).rejects.toThrow();
  });

  it("upload succeeds for admin", async () => {
    vi.mocked(storage.storagePut).mockResolvedValue({ key: "test_abc.jpg", url: "/manus-storage/test_abc.jpg" });
    vi.mocked(db.createGalleryPhoto).mockResolvedValue({
      id: 1, title: "Test", description: null, imageUrl: "/manus-storage/test_abc.jpg",
      storageKey: "test_abc.jpg", category: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
    } as any);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.upload({
      fileName: "test.jpg",
      fileBase64: "dGVzdA==",
      contentType: "image/jpeg",
      title: "Test",
    });

    expect(result.title).toBe("Test");
    expect(storage.storagePut).toHaveBeenCalledOnce();
    expect(db.createGalleryPhoto).toHaveBeenCalledOnce();
  });

  it("delete requires admin role", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.gallery.delete({ id: 1 })).rejects.toThrow();
  });

  it("delete succeeds for admin", async () => {
    vi.mocked(db.deleteGalleryPhoto).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.gallery.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

describe("reviews", () => {
  it("listApproved returns only approved reviews (public)", async () => {
    const mockReviews = [
      { id: 1, authorName: "Test", rating: 5, comment: "Great!", lang: "es", approved: "approved", createdAt: new Date(), updatedAt: new Date() },
    ];
    vi.mocked(db.getApprovedReviews).mockResolvedValue(mockReviews);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.listApproved();

    expect(result).toEqual(mockReviews);
    expect(db.getApprovedReviews).toHaveBeenCalledOnce();
  });

  it("create is public and notifies owner", async () => {
    vi.mocked(db.createReview).mockResolvedValue({
      id: 1, authorName: "Test", rating: 5, comment: "Great!", lang: "es",
      approved: "pending", createdAt: new Date(), updatedAt: new Date(),
    } as any);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.create({
      authorName: "Test",
      rating: 5,
      comment: "Great!",
      lang: "es",
    });

    expect(result.authorName).toBe("Test");
    expect(db.createReview).toHaveBeenCalledOnce();
    expect(notifyOwner).toHaveBeenCalledOnce();
  });

  it("create validates rating range (1-5)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.reviews.create({ authorName: "Test", rating: 0, comment: "Bad", lang: "es" })
    ).rejects.toThrow();
    await expect(
      caller.reviews.create({ authorName: "Test", rating: 6, comment: "Great", lang: "es" })
    ).rejects.toThrow();
  });

  it("approve requires admin", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.reviews.approve({ id: 1 })).rejects.toThrow();
  });

  it("approve succeeds for admin", async () => {
    vi.mocked(db.updateReviewStatus).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.reviews.approve({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

describe("contact", () => {
  it("submit is public and notifies owner", async () => {
    vi.mocked(db.createContactMessage).mockResolvedValue({
      id: 1, name: "Test", email: "test@test.com", message: "Hello",
      lang: "es", read: "unread", createdAt: new Date(),
    } as any);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.contact.submit({
      name: "Test",
      email: "test@test.com",
      message: "Hello",
      lang: "es",
    });

    expect(result).toEqual({ success: true });
    expect(db.createContactMessage).toHaveBeenCalledOnce();
    expect(notifyOwner).toHaveBeenCalledOnce();
  });

  it("submit validates email format", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contact.submit({ name: "Test", email: "not-an-email", message: "Hello", lang: "es" })
    ).rejects.toThrow();
  });

  it("listAll requires admin", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.contact.listAll()).rejects.toThrow();
  });

  it("listAll succeeds for admin", async () => {
    vi.mocked(db.getAllContactMessages).mockResolvedValue([]);
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.contact.listAll();
    expect(result).toEqual([]);
  });
});
