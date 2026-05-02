export function makeQb(defaultData: any = null, defaultError: any = null) {
  const result = { data: defaultData, error: defaultError };
  const qb: Record<string, any> = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
    then: (
      onFulfilled: (v: any) => any,
      onRejected?: (e: any) => any
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
    catch: (onRejected: (e: any) => any) =>
      Promise.resolve(result).catch(onRejected),
    finally: (onFinally: () => void) =>
      Promise.resolve(result).finally(onFinally),
  };
  return qb;
}

export function buildMockSupabase() {
  const defaultQb = makeQb();
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: jest.fn().mockReturnValue(defaultQb),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    _makeQb: makeQb,
    _defaultQb: defaultQb,
  };
}

export type MockSupabase = ReturnType<typeof buildMockSupabase>;
