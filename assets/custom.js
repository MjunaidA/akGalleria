let seeMore = document.querySelectorAll(".see-more-btn");
seeMore && seeMore.forEach((i) => {
    i.addEventListener("click",function(){
        i.closest(".studio-desc-wrap").classList.remove("desc-fix-height");
        this.classList.add("cstm-hide")
    })
})
let videPlay = document.querySelectorAll(".studio-slide-images .video-play-btn");
videPlay && videPlay.forEach((videoPlay) => {
    videoPlay.addEventListener("click",function(){
        let video = this.closest(".video-banner").querySelector("video")
        this.classList.add("cstm-hide")
        console.log("video",video)
        video.play()
    })
})
let studioVideo = document.querySelectorAll(".studio-slide-images .video-banner video");

studioVideo && studioVideo.forEach((el) => {
 el.addEventListener("click",function(){
    let playButton = this.closest(".video-banner").querySelector(".video-play-btn");
    playButton.classList.remove("cstm-hide");
    this.pause();
 })
})



// modalClose = document.querySelector("#mbl-modal-close");
// modalClose.addEventListener("click",function(){
//     console.log("this",this)
//     let mblDisclosure = this.closest("details.mobile-facets__disclosure");
//     console.log("mblDisclosure",mblDisclosure   )

// })



let headerHeight = document.querySelector(".header-wrapper").getBoundingClientRect().height;
let mainLayoutContent = document.querySelector(".main-content-layout");

// console.log("headerHeight",headerHeight)
// console.log("mainLayoutContent",mainLayoutContent)
mainLayoutContent.classList.add("headerHeight")

mainLayoutContent.style.marginTop = headerHeight+"px"







// let PDPFancyBox = document.querySelector('[data-fancybox="gallery"]');
// if( PDPFancyBox ) {
//     Fancybox.bind('[data-fancybox="gallery"]', {
//         Thumbs: {
//             type: "classic",
//         },
//         idle: false,
//         Toolbar: {
//             display: {
//             left: [],
//             middle: ["infobar"],
//             right: ["close"],
//             },
//         },
//     });
// }



let PDPFancyBox = document.querySelector('[data-fancybox="gallery"]');
if( PDPFancyBox ) {
    Fancybox.bind('[data-fancybox="gallery"]', {
        Thumbs: {
            type: "classic",
        },
        Carousel: {
          infinite: false,
        },
        idle: false,
        Toolbar: {
            display: {
            left: [],
            middle: ["infobar"],
            right: ["close"],
            },
        },
    });
}

let PDPFancyBoxMbl = document.querySelector('[data-fancybox="galleryMbl"]');
if( PDPFancyBoxMbl ) {
    Fancybox.bind('[data-fancybox="galleryMbl"]', {
        Thumbs: {
            type: "classic",
        },
        Carousel: {
          infinite: false,
        },
        idle: false,
        Toolbar: {
            display: {
            left: [],
            middle: ["infobar"],
            right: ["close"],
            },
        },
    });
}




// let PDPFancyBoxes = document.querySelectorAll('[data-fancybox="gallery"]');
// if (PDPFancyBoxes.length > 0) {
//     PDPFancyBoxes.forEach(PDPFancyBox => {
//         Fancybox.bind(PDPFancyBox, {
//             Thumbs: {
//                 type: "classic",
//             },
//             idle: false,
//             Toolbar: {
//                 display: {
//                     left: [],
//                     middle: ["infobar"],
//                     right: ["close"],
//                 },
//             },
//         });
//     });
// }

