import { checkDemoLink, checkRepoDemoLinks } from '../lib/demoChecker';

describe('demoChecker', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns checked:false for invalid or empty urls', async () => {
    const res = await checkDemoLink('');
    expect(res.checked).toBe(false);
    expect(res.isLive).toBe(false);
  });

  it('reports isLive:true when fetch succeeds with 200 OK', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    const res = await checkDemoLink('https://my-app.vercel.app');
    expect(res.isLive).toBe(true);
    expect(res.checked).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://my-app.vercel.app', expect.objectContaining({ method: 'HEAD' }));
  });

  it('reports isLive:false when fetch rejects on broken link', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error / 404'));

    const res = await checkDemoLink('https://broken-demo.example.com');
    expect(res.isLive).toBe(false);
    expect(res.checked).toBe(true);
  });

  it('checks multiple repositories in checkRepoDemoLinks', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('good')) {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.reject(new Error('DNS Failure'));
    });

    const repos = [
      { name: 'app-good', homepage: 'https://good.app' },
      { name: 'app-bad', homepage: 'https://bad.app' },
      { name: 'app-no-demo', homepage: '' },
    ];

    const results = await checkRepoDemoLinks(repos);
    expect(results['app-good'].isLive).toBe(true);
    expect(results['app-bad'].isLive).toBe(false);
    expect(results['app-no-demo']).toBeUndefined();
  });
});
