// @ts-check
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const strategy = process.argv[2] || "patch";

execSync(`yarn version ${strategy}`);

const cwd = process.cwd();
const pkgJsonPath = join(cwd, "package.json");
const jsrJsonPath = join(cwd, "jsr.json");

const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
const jsrJson = JSON.parse(readFileSync(jsrJsonPath, "utf-8"));

const version = pkgJson.version;
jsrJson.version = version;

writeFileSync(jsrJsonPath, JSON.stringify(jsrJson, null, 2));

execSync(`git add package.json jsr.json`);
execSync(`git commit -m 'bump to v${version}'`);
execSync(`git tag -a v${version}`);
execSync(`git push --tags`);
