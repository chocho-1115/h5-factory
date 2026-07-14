import { execSync } from 'node:child_process'
import projectConfig from './project.js'

// argv参数
const biomeCli = ['--biome-lint', '--biome-check', '--biome-format'];
const args = process.argv.slice(2);

// node环境变量
const name = process.env.name
const dir = process.env.dir
let pathStr = ''
if(name){
  pathStr = projectConfig.src
}else if(dir){
  pathStr = dir
}

// biome命令
const activeCli = biomeCli.find(arg => args.includes(arg))?.replace('--biome-', '')
const otherStr = args.filter(arg => !biomeCli.includes(arg)).join(' ');
const cliStr = `biome ${activeCli} ${otherStr} ${pathStr}`

console.log('===>biome命令:', cliStr)
execSync(cliStr, { stdio: 'inherit' });
