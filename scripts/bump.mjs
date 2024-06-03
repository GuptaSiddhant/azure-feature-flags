// @ts-check
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const strategy = process.argv[2] || "patch";
/** @type {import("node:child_process").ExecSyncOptions} */
const options = { encoding: "utf-8", stdio: "inherit" };

// Break on failed tests
execSync(`yarn test`, options);

execSync(`yarn version ${strategy}`, options);

const cwd = process.cwd();
const pkgJsonPath = join(cwd, "package.json");
const jsrJsonPath = join(cwd, "jsr.json");

const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
const jsrJson = JSON.parse(readFileSync(jsrJsonPath, "utf-8"));

const version = pkgJson.version;

console.log("Updating JSR version to ", version);
jsrJson.version = version;
writeFileSync(jsrJsonPath, JSON.stringify(jsrJson, null, 2));

execSync(`git add package.json jsr.json`, options);
execSync(`git commit -m 'bump to v${version}'`, options);

console.log("Creating tag v" + version);
execSync(`git tag -a 'v${version}' -m "Bump to v${version}"`, options);

console.log("Pushing to origin");
execSync(`git push --tags`, options);
execSync(`git push`, options);

process.exit(0);
