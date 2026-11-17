import { detectLicense, getBuildToolchain, generateReadmeMarkdown } from './projectStackHelper';

describe('projectStackHelper', () => {
  describe('detectLicense', () => {
    it('detects GPL-2.0 for Linux kernel repository', () => {
      const linuxRepo = { name: 'linux', full_name: 'torvalds/linux', description: 'Linux kernel source tree' };
      const license = detectLicense(linuxRepo);
      expect(license.spdx).toBe('GPL-2.0');
      expect(license.name).toContain('GNU General Public License');
      expect(license.badgeUrl).toContain('GPL--2.0');
      expect(license.notice).toContain('GPL-2.0');
      expect(license.notice).not.toContain('MIT');
    });

    it('detects Apache-2.0 from license object', () => {
      const repo = { name: 'my-lib', license: { spdx_id: 'Apache-2.0', name: 'Apache 2.0' } };
      const license = detectLicense(repo);
      expect(license.spdx).toBe('Apache-2.0');
      expect(license.notice).toContain('Apache');
    });

    it('falls back to permissive open-source without assuming MIT', () => {
      const repo = { name: 'unlicensed-project', license: null };
      const license = detectLicense(repo);
      expect(license.spdx).toBe('Open Source');
      expect(license.notice).not.toContain('MIT License');
    });
  });

  describe('getBuildToolchain', () => {
    it('returns kernel make commands for Linux project', () => {
      const repo = { name: 'linux', language: 'C', description: 'Linux kernel source tree' };
      const toolchain = getBuildToolchain(repo);
      expect(toolchain.language).toBe('C');
      expect(toolchain.installCmd).toContain('make defconfig');
      expect(toolchain.runCmd).toContain('make -j$(nproc)');
      expect(toolchain.testCmd).toContain('make kselftest');
      expect(toolchain.installCmd).not.toContain('npm');
      expect(toolchain.runCmd).not.toContain('npm');
    });

    it('returns Cargo commands for Rust project', () => {
      const repo = { name: 'ripgrep', language: 'Rust' };
      const toolchain = getBuildToolchain(repo);
      expect(toolchain.installCmd).toContain('cargo check');
      expect(toolchain.runCmd).toContain('cargo run');
      expect(toolchain.testCmd).toContain('cargo test');
    });

    it('returns Go commands for Go project', () => {
      const repo = { name: 'k8s', language: 'Go' };
      const toolchain = getBuildToolchain(repo);
      expect(toolchain.installCmd).toContain('go mod download');
      expect(toolchain.runCmd).toContain('go run');
      expect(toolchain.testCmd).toContain('go test');
    });

    it('returns Python commands for Python project', () => {
      const repo = { name: 'fastapi-app', language: 'Python' };
      const toolchain = getBuildToolchain(repo);
      expect(toolchain.installCmd).toContain('pip install');
      expect(toolchain.testCmd).toContain('pytest');
    });

    it('returns npm commands for JavaScript project', () => {
      const repo = { name: 'react-app', language: 'JavaScript' };
      const toolchain = getBuildToolchain(repo);
      expect(toolchain.installCmd).toContain('npm install');
      expect(toolchain.runCmd).toContain('npm run dev');
    });
  });

  describe('generateReadmeMarkdown', () => {
    it('generates a complete README for torvalds/linux with GPL-2.0 and kernel build commands', () => {
      const repo = {
        name: 'linux',
        full_name: 'torvalds/linux',
        language: 'C',
        description: 'Linux kernel source tree',
      };
      const readme = generateReadmeMarkdown(repo, 'torvalds');
      expect(readme).toContain('# linux');
      expect(readme).toContain('GPL-2.0');
      expect(readme).toContain('make defconfig');
      expect(readme).toContain('make -j$(nproc)');
      expect(readme).not.toContain('npm install');
      expect(readme).not.toContain('npm run dev');
      expect(readme).not.toContain('MIT License');
    });
  });
});
