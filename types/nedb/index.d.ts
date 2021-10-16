interface Nedb<G = any> {
  findOne(doc: Partial<G>, callback: (error: Error | null, doc: G | null) => void);
  find(doc: Partial<G>, callback: (error: Error | null, doc: G[] | null) => void);

  insert<T extends G>(newDoc: Omit<T, '_id'>, cb?: (err: Error | null, document: T) => void): void;
  insert<T extends G>(newDocs: Omit<T, '_id'>[], cb?: (err: Error | null, documents: T[]) => void): void;
}