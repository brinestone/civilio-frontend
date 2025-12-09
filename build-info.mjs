import fs from 'fs';
import cp from 'child_process';
import {join} from "path";

const p = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const {version, description, license, displayName, author, contributors} = p;

const out = String(cp.spawnSync('git', ['log', `--grep=${version}`]).stdout).toString();
const dateLine = out.split('\n').find(line => line.includes('Date:'));

const date = new Date(dateLine.split('Date:')[1].trim())

const content = JSON.stringify({
	author,
	date,
	contributors,
	description,
	displayName,
	license,
	version
});
const dir = join(import.meta.dirname, 'dist/assets');
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir, {recursive: true});
}
fs.writeFileSync(join(dir, 'build.json'), content);
