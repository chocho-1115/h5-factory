import * as style from './styles.module.scss' 

export default ({ children, className }) => {
    return (
        <section className={`${style.wrap} ${className}`}>
            <div className={style.main}>
                {children}
            </div>
        </section>
    )
}