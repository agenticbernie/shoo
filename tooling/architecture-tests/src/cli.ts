import { resolve } from 'node:path';
import { checkArchitecture } from './check.js';

/**
 * `pnpm architecture:check`
 *
 * Runs on every PR (docs/46 "Static architecture ... every CI run"). Exit code 1 fails the
 * build; every violation names the file, the import and the documented rule it broke.
 */
async function main(): Promise<void> {
  const repoRoot = resolve(process.argv[2] ?? process.cwd(), '..', '..');
  const report = await checkArchitecture({ repoRoot });

  if (report.violations.length === 0) {
    console.log(
      `architecture check passed: ${report.packagesChecked} packages, ${report.filesChecked} files`,
    );
    return;
  }

  console.error(`architecture check FAILED with ${report.violations.length} violation(s):\n`);
  for (const violation of report.violations) {
    console.error(`  ${violation.file}`);
    console.error(`    imports ${violation.importPath}`);
    console.error(`    ${violation.why} [${violation.rule}]\n`);
  }
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
