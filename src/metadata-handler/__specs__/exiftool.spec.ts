import { exiftoolVersion } from '../exiftool';

vi.mock('@tauri-apps/plugin-shell');

describe('exiftoolVersion', () => {
  it('returns the version string from the bundled exiftool', async () => {
    const version = await exiftoolVersion();
    expect(version).toMatch(/^\d+\.\d+/);
  });
});
