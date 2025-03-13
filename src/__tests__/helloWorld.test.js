test('hello world!', async () => {
    const result = await new Promise(resolve => setTimeout(() => resolve('Hello, World!'), 100));
    expect(result).toBe('Hello, World!');
});

afterEach(() => {
    jest.clearAllTimers();
});