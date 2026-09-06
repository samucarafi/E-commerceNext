import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (typeof MONGODB_URI !== "string" || MONGODB_URI.length === 0) {
  throw new Error("MONGODB_URI não está definida.");
}

const mongoUri: string = MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

global.mongoose = cached;

export async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri);
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
