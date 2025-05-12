export const setAppBG = (url)=>{
    let app  = document.querySelector('#app')
    if(app ){
        if (url) {
            app.style.backgroundImage = `url('${url}')`
        }else{
            app.style.background = 'var(--linegrad)'
        }
    }
}