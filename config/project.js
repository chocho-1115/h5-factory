const name = process.env.name

export default {
    name,
    dist: `./dist/${name}/`,
    src: ['template', 'template-react'].indexOf(name) > -1 ? `./${name}/` : `./src/${name}/`
}


