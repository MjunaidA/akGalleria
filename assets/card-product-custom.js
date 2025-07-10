if (window.innerWidth > 900) {


let gridItem = document.querySelectorAll("#product-grid li");
var swiper;

gridItem && gridItem.forEach((el) => {
    el.addEventListener("mouseenter", function() {
        let pdSlide = el.querySelector(".swiper");
        pdSlide.classList.add("pd_slider");
         swiper = new Swiper(pdSlide, {
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            autoplay: {
                delay: 1500,
            },
        });        
    });

    el.addEventListener("mouseleave", function() {
        let pdSlide = el.querySelector(".swiper");
        swiper.destroy();
    });
});

}

addEventListener("DOMContentLoaded", (event) => {
    let wishItem = document.querySelectorAll(".wishlist-mbl");
    wishItem && wishItem.forEach((wish) => {
        wish.classList.remove("hidden");
    })
});