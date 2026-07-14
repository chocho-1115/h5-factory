import fs from 'node:fs'
import path from 'node:path'
// import chalk from 'chalk'

const __dirname = path.resolve()

const projectName = process.env.name
let srcDir = ''
const tarDir = path.join(__dirname, `./src/${projectName}`)
const isUseReact = !!process.env.npm_config_react

if(!projectName){
    throw '新建项目名称不能为空：npm run create projectName'
}

if(isUseReact){
    srcDir = path.join(__dirname, '/template-react')
}else{
    srcDir = path.join(__dirname, '/template')
}

if(fs.existsSync(tarDir)){
    throw `${tarDir}·目录已存在`
}else{
    fs.mkdir(tarDir, {recursive: true}, (err) => {
        if (err) {
            console.log(err)
            return
        }
        copyFolder(srcDir, tarDir, ()=> {
            // console.log(' \n' + chalk.green.bold(` [${projectName}] Create completed`) + ' \n')
            console.log(' Path', tarDir)
            console.log(` Run \`npm run dev ${projectName}\` \n`)
        })
    })
}

// 将源文件拷贝到目标文件
// 将srcPath路径的文件复制到tarPath
const copyFile = (srcPath, tarPath, cb) => {
    const rs = fs.createReadStream(srcPath)
    rs.on('error', (err) => {
        if (err) {
            console.log('read error', srcPath)
        }
        cb?.(err)
    })
 
    const ws = fs.createWriteStream(tarPath)
    ws.on('error', (err) => {
        if (err) {
            console.log('write error', tarPath)
        }
        cb?.(err)
    })
    ws.on('close', (ex) => {
        cb?.(ex)
    })
 
    rs.pipe(ws)
}

// 将srcDir文件下的文件、文件夹递归的复制到tarDir下
const copyFolder = (srcDir, tarDir, cb) => {
    fs.readdir(srcDir, (err, files) => {
        let count = 0
        const checkEnd = () => {
            ++count === files.length && cb && cb()
        }
 
        if (err) {
            checkEnd()
            return
        }
 
        files.forEach((file) => {
            const srcPath = path.join(srcDir, file)
            const tarPath = path.join(tarDir, file)
 
            fs.stat(srcPath, (_err, stats) => {
                if (stats.isDirectory()) {
                    
                    console.log('mkdir', tarPath)

                    fs.mkdir(tarPath, (err) => {
                        if (err) {
                            console.log(err)
                            return
                        }
                        copyFolder(srcPath, tarPath, checkEnd)
                    })
                } else {
                    copyFile(srcPath, tarPath, checkEnd)
                }
            })
        })
 
        // 为空时直接回调
        files.length === 0 && cb && cb()
    })
}





