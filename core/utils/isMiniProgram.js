function isMiniProgram() {
    let userAgent = navigator.userAgent
    return (
        (/miniProgram/i.test(userAgent) && /micromessenger/i.test(userAgent)) ||
        /toutiaomicroapp/i.test(userAgent)
    )
}

export default isMiniProgram
