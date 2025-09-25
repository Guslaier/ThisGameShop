
let container = document.getElementById("ShopExplo");
document.querySelectorAll('.layout').forEach(d => {
    d.addEventListener("click", (e) => {
        const el = e.currentTarget;
        if (el.getAttribute("active") === "False") {
            container.classList.toggle("horizontal");
            container.classList.toggle("normal");
            el.setAttribute("active", "True");
            if (el.getAttribute("id") === "gitQ") {
                document.getElementById("gitW").setAttribute("active", "False");
            }
            if (el.getAttribute("id") === "gitW") {
                document.getElementById("gitQ").setAttribute("active", "False");
            }
        } else if (el.getAttribute("active") != "True") {
            el.setAttribute("active", "False");
        }
    });
});


let g = container.firstElementChild;

for (let i = 0; i < 100; i++) {
    let clone = g.cloneNode(true);
    container.appendChild(clone);
}




