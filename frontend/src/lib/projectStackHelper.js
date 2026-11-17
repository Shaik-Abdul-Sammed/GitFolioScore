/**
 * Project Stack & License Helper
 * Accurately detects tech stacks, build commands, and open-source licenses
 * to ensure generated documentation matches actual repository engineering realities.
 */

/**
 * Detect license details from repository metadata or well-known projects (e.g. Linux kernel).
 * @param {object} repo - GitHub repository object.
 * @returns {object} { spdx, name, badgeUrl, licenseUrl, notice }
 */
export function detectLicense(repo) {
  const repoName = (repo?.name || '').toLowerCase();
  const repoFullName = (repo?.full_name || '').toLowerCase();

  // Torvalds / Linux kernel special detection
  if (repoName === 'linux' || repoFullName === 'torvalds/linux' || (repo?.description && /linux kernel source tree/i.test(repo.description))) {
    return {
      spdx: 'GPL-2.0',
      name: 'GNU General Public License v2.0',
      badgeUrl: 'https://img.shields.io/badge/License-GPL--2.0-blue.svg',
      licenseUrl: 'https://www.gnu.org/licenses/old-licenses/gpl-2.0.html',
      notice: 'Distributed under the GNU General Public License v2.0 (GPL-2.0). See `COPYING` for more information.',
    };
  }

  // Repository license property (object or string)
  let licenseSpdx = '';
  let licenseName = '';

  if (typeof repo?.license === 'object' && repo.license !== null) {
    licenseSpdx = repo.license.spdx_id || repo.license.key?.toUpperCase() || '';
    licenseName = repo.license.name || licenseSpdx;
  } else if (typeof repo?.license === 'string') {
    licenseSpdx = repo.license;
    licenseName = repo.license;
  }

  // Normalize common SPDX identifiers
  const spdxUpper = (licenseSpdx || '').toUpperCase();
  if (spdxUpper.includes('GPL-2.0') || spdxUpper.includes('GPLV2')) {
    return {
      spdx: 'GPL-2.0',
      name: 'GNU General Public License v2.0',
      badgeUrl: 'https://img.shields.io/badge/License-GPL--2.0-blue.svg',
      licenseUrl: 'https://www.gnu.org/licenses/old-licenses/gpl-2.0.html',
      notice: 'Distributed under the GNU General Public License v2.0 (GPL-2.0). See `COPYING` or `LICENSE` for details.',
    };
  }

  if (spdxUpper.includes('GPL-3.0') || spdxUpper.includes('GPLV3')) {
    return {
      spdx: 'GPL-3.0',
      name: 'GNU General Public License v3.0',
      badgeUrl: 'https://img.shields.io/badge/License-GPL--3.0-blue.svg',
      licenseUrl: 'https://www.gnu.org/licenses/gpl-3.0.html',
      notice: 'Distributed under the GNU General Public License v3.0 (GPL-3.0). See `COPYING` or `LICENSE` for details.',
    };
  }

  if (spdxUpper.includes('APACHE')) {
    return {
      spdx: 'Apache-2.0',
      name: 'Apache License 2.0',
      badgeUrl: 'https://img.shields.io/badge/License-Apache_2.0-blue.svg',
      licenseUrl: 'https://opensource.org/licenses/Apache-2.0',
      notice: 'Distributed under the Apache License 2.0. See `LICENSE` for details.',
    };
  }

  if (spdxUpper.includes('BSD-3') || spdxUpper.includes('BSD-2') || spdxUpper.includes('BSD')) {
    return {
      spdx: 'BSD',
      name: 'BSD License',
      badgeUrl: 'https://img.shields.io/badge/License-BSD-blue.svg',
      licenseUrl: 'https://opensource.org/licenses/BSD-3-Clause',
      notice: 'Distributed under the BSD License. See `LICENSE` for details.',
    };
  }

  if (spdxUpper.includes('MIT')) {
    return {
      spdx: 'MIT',
      name: 'MIT License',
      badgeUrl: 'https://img.shields.io/badge/License-MIT-yellow.svg',
      licenseUrl: 'https://opensource.org/licenses/MIT',
      notice: 'Distributed under the MIT License. See `LICENSE` for details.',
    };
  }

  if (licenseSpdx && licenseSpdx !== 'NOASSERTION') {
    const safeTag = encodeURIComponent(licenseSpdx.replace(/-/g, '--'));
    return {
      spdx: licenseSpdx,
      name: licenseName || licenseSpdx,
      badgeUrl: `https://img.shields.io/badge/License-${safeTag}-blue.svg`,
      licenseUrl: `https://spdx.org/licenses/${encodeURIComponent(licenseSpdx)}.html`,
      notice: `Distributed under the ${licenseName || licenseSpdx} License. See \`LICENSE\` for details.`,
    };
  }

  // Open source fallback (do not assume MIT)
  return {
    spdx: 'Open Source',
    name: 'Open Source / Permissive License',
    badgeUrl: 'https://img.shields.io/badge/License-Open%20Source-blue.svg',
    licenseUrl: 'https://opensource.org/licenses',
    notice: 'Distributed under open-source terms. See `LICENSE` or repository root for specific terms.',
  };
}

/**
 * Detect language toolchains, prerequisites, and build/run commands.
 * @param {object} repo - GitHub repository object.
 * @returns {object} Toolchain instructions.
 */
export function getBuildToolchain(repo) {
  const lang = (repo?.language || '').trim();
  const repoName = (repo?.name || 'project').toLowerCase();
  const desc = (repo?.description || '').toLowerCase();

  // Linux kernel or low-level C kernel project
  if (repoName === 'linux' || desc.includes('linux kernel source tree') || (lang === 'C' && repoName.includes('kernel'))) {
    return {
      language: 'C',
      ecosystem: 'Linux Kernel & Systems',
      prereqs: 'GCC, Make, binutils, flex, bison, libssl-dev, libelf-dev',
      installCmd: '# Configure Linux kernel build target\nmake defconfig # or make menuconfig',
      runCmd: '# Build Linux kernel and modules using all CPU cores\nmake -j$(nproc)',
      testCmd: '# Run kernel self-tests\nmake kselftest',
      tooling: 'Kbuild, Make, GCC / Clang',
    };
  }

  // C / C++
  if (lang === 'C' || lang === 'C++') {
    return {
      language: lang,
      ecosystem: 'C/C++ Native Systems',
      prereqs: 'CMake (3.20+), Make or Ninja, GCC or Clang',
      installCmd: '# Configure build directory\nmkdir -p build && cd build\ncmake ..',
      runCmd: '# Compile native binaries\nmake\n./' + (repo?.name || 'app'),
      testCmd: '# Run test suite\nctest --output-on-failure',
      tooling: 'CMake, Make, GCC / Clang, CTest',
    };
  }

  // Rust
  if (lang === 'Rust') {
    return {
      language: 'Rust',
      ecosystem: 'Rust Cargo',
      prereqs: 'Rust 1.75+, Cargo',
      installCmd: '# Fetch dependencies and verify build\ncargo check',
      runCmd: '# Build and run release binary\ncargo run --release',
      testCmd: '# Run unit and integration tests\ncargo test',
      tooling: 'Cargo, Clippy, rustfmt',
    };
  }

  // Go
  if (lang === 'Go') {
    return {
      language: 'Go',
      ecosystem: 'Go Modules',
      prereqs: 'Go 1.21+',
      installCmd: '# Download Go module dependencies\ngo mod download',
      runCmd: '# Build and run package\ngo run .',
      testCmd: '# Run automated package tests\ngo test -v ./...',
      tooling: 'Go Modules, golangci-lint',
    };
  }

  // Python
  if (lang === 'Python') {
    return {
      language: 'Python',
      ecosystem: 'Python Virtualenv & Pip',
      prereqs: 'Python 3.10+, pip',
      installCmd: '# Create virtual environment and install dependencies\npython3 -m venv .venv\nsource .venv/bin/activate\npip install -r requirements.txt',
      runCmd: '# Run application\npython main.py',
      testCmd: '# Run test suite\npytest',
      tooling: 'pip, venv, pytest, ruff',
    };
  }

  // Java
  if (lang === 'Java') {
    return {
      language: 'Java',
      ecosystem: 'Java JVM / Maven',
      prereqs: 'JDK 17+, Maven or Gradle',
      installCmd: '# Build artifacts and resolve dependencies\n./mvnw clean install',
      runCmd: '# Run application\n./mvnw spring-boot:run',
      testCmd: '# Execute unit tests\n./mvnw test',
      tooling: 'Maven, JUnit 5',
    };
  }

  // Kotlin
  if (lang === 'Kotlin') {
    return {
      language: 'Kotlin',
      ecosystem: 'Kotlin / Gradle',
      prereqs: 'JDK 17+, Gradle',
      installCmd: '# Build project via Gradle wrapper\n./gradlew build',
      runCmd: '# Run application\n./gradlew run',
      testCmd: '# Run tests\n./gradlew test',
      tooling: 'Gradle, Kotest',
    };
  }

  // Ruby
  if (lang === 'Ruby') {
    return {
      language: 'Ruby',
      ecosystem: 'Ruby Bundler',
      prereqs: 'Ruby 3.1+, Bundler',
      installCmd: '# Install gem dependencies\nbundle install',
      runCmd: '# Run application\nbundle exec ruby main.rb',
      testCmd: '# Run test suite\nbundle exec rspec',
      tooling: 'Bundler, RSpec, RuboCop',
    };
  }

  // PHP
  if (lang === 'PHP') {
    return {
      language: 'PHP',
      ecosystem: 'PHP Composer',
      prereqs: 'PHP 8.2+, Composer',
      installCmd: '# Install Composer packages\ncomposer install',
      runCmd: '# Launch development server\nphp -S localhost:8000',
      testCmd: '# Execute tests\nvendor/bin/phpunit',
      tooling: 'Composer, PHPUnit',
    };
  }

  // Shell / Bash
  if (lang === 'Shell' || lang === 'Bash') {
    return {
      language: 'Shell',
      ecosystem: 'POSIX Shell Scripts',
      prereqs: 'Bash 4+, coreutils',
      installCmd: '# Grant execution permissions\nchmod +x *.sh',
      runCmd: `# Execute main script\n./${repo?.name || 'run'}.sh`,
      testCmd: '# Static analysis for shell scripts\nshellcheck *.sh',
      tooling: 'Bash, ShellCheck',
    };
  }

  // JavaScript / TypeScript / Frontend / Web
  if (lang === 'JavaScript' || lang === 'TypeScript' || !lang) {
    const isTS = lang === 'TypeScript';
    return {
      language: isTS ? 'TypeScript' : 'JavaScript',
      ecosystem: 'Node.js / npm',
      prereqs: 'Node.js (18+), npm or pnpm',
      installCmd: '# Install package dependencies\nnpm install',
      runCmd: '# Start local development server\nnpm run dev',
      testCmd: '# Run test suite\nnpm test',
      tooling: 'npm, Vite / Webpack, ESLint, Jest / Vitest',
    };
  }

  // Generic fallback
  return {
    language: lang,
    ecosystem: `${lang} Environment`,
    prereqs: `Standard ${lang} development toolchain`,
    installCmd: `# Install dependencies for ${lang}\n# Consult repository setup instructions`,
    runCmd: `# Execute ${lang} application\n# Refer to documentation`,
    testCmd: `# Run ${lang} test suite`,
    tooling: `${lang} Standard Tooling, Git, CI/CD`,
  };
}

/**
 * Generate a complete, tech-stack-accurate README in markdown format.
 * @param {object} repo - GitHub repository object.
 * @param {string} username - GitHub username.
 * @returns {string} Fully formatted Markdown README.
 */
export function generateReadmeMarkdown(repo, username = 'developer') {
  const repoName = repo?.name || 'project';
  const desc = repo?.description || 'A comprehensive open-source project engineered with clean architecture.';
  const licenseInfo = detectLicense(repo);
  const toolchain = getBuildToolchain(repo);

  return `# ${repoName}

> ${desc}

[![License: ${licenseInfo.spdx}](${licenseInfo.badgeUrl})](${licenseInfo.licenseUrl})
[![GitFolioScore](https://img.shields.io/badge/GitFolioScore-Audited-6366f1.svg)](https://anna.partners/apps/gitfolioscore)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

## ⚡ Overview
${desc} Engineered in **${toolchain.language}** (${toolchain.ecosystem}), focusing on high performance, clean modular design, and robust test hygiene.

## ✨ Key Features
- **Architectural Rigor**: Clean separation of concerns with reusable, decoupled modules.
- **High Performance**: Optimized for fast compilation, minimal resource overhead, and low latency.
- **Reliable Engineering**: Comprehensive automated test coverage and strict static analysis.
- **Production Ready**: Reproducible build toolchain and CI/CD automation.

## 🚀 Quick Start

### Prerequisites
- \`${toolchain.prereqs}\`
- \`git\`

\`\`\`bash
# 1. Clone repository
git clone https://github.com/${username}/${repoName}.git
cd ${repoName}

# 2. Setup & Dependencies
${toolchain.installCmd}

# 3. Build & Run
${toolchain.runCmd}
\`\`\`

## 🧪 Testing & Validation
\`\`\`bash
${toolchain.testCmd}
\`\`\`

## 🛠️ Tech Stack & Tooling
- **Primary Language**: ${toolchain.language}
- **Ecosystem**: ${toolchain.ecosystem}
- **Tooling**: ${toolchain.tooling}

## 📄 License
${licenseInfo.notice}

---
*Generated via [GitFolioScore](https://anna.partners/apps/gitfolioscore) AI Engineering Suite.*
`;
}
