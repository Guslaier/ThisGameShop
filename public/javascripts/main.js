var show = 0
document.getElementById('pf').addEventListener("click",(e) => {
    if (show == 0){
        show = 1
        document.getElementById('menu').style.display = "block"
    }else
    {
        show = 0
        document.getElementById('menu').style.display = "none"
    }
    
});


