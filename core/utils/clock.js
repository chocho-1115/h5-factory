function clock (opt){
    opt.framerate = opt.framerate||1
    opt.nowTime = opt.nowTime||new Date().getTime()
    let startTime = new Date().getTime()
    let res = {
        year: 0,
        month: 0,
        date: 0,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }
    function anim(){
        let time = (new Date().getTime() - startTime) + opt.nowTime
        let D = new Date(time)
        res.year = D.getFullYear()
        res.month = D.getMonth()+1
        res.date = D.getDate()
        res.hour = D.getHours()
        res.minute = D.getMinutes()
        res.second = D.getSeconds()
        res.millisecond = D.getMilliseconds()
        if(opt.onUpdate)opt.onUpdate(res)
    }
    let timer = setInterval(anim, 1000/opt.framerate)
    anim()
    return timer
}

export default clock
